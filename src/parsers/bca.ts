import type { BankParser, BankStatement, ParseResult, Transaction } from './types';

const ID_MONTH_MAP: Record<string, string> = {
  januari: '01', februari: '02', maret: '03', april: '04',
  mei: '05', juni: '06', juli: '07', agustus: '08',
  september: '09', oktober: '10', november: '11', desember: '12',
};

function parseAmount(str: string): number {
  if (!str || str.trim() === '' || str.trim() === '-') return 0;
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function extractYearFromPeriode(text: string): string {
  const match = text.match(/PERIODE\s*:?\s*\w+\s+(\d{4})/i);
  return match ? match[1] : String(new Date().getFullYear());
}

function extractMetadata(text: string): Partial<BankStatement> {
  const meta: Partial<BankStatement> = {};

  const currencyMatch = text.match(/MATA UANG\s*:?\s*(\w+)/i);
  meta.currency = currencyMatch ? currencyMatch[1].trim() : 'IDR';

  const accountMatch = text.match(/NO\.\s*REKENING\s*:?\s*([\d-]+)/i);
  if (accountMatch) meta.accountNo = accountMatch[1].trim();

  const branchMatch = text.match(/^KCP\s+(.+)$/im);
  if (branchMatch) meta.branch = `KCP ${branchMatch[1].trim()}`;

  // Period: "DESEMBER 2025" → 01/12/2025 - 31/12/2025
  const periodeMatch = text.match(/PERIODE\s*:?\s*(\w+)\s+(\d{4})/i);
  if (periodeMatch) {
    const monthName = periodeMatch[1].toLowerCase();
    const year = periodeMatch[2];
    const monthNum = ID_MONTH_MAP[monthName];
    if (monthNum) {
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
      meta.periodStart = `01/${monthNum}/${year}`;
      meta.periodEnd = `${String(lastDay).padStart(2, '0')}/${monthNum}/${year}`;
    }
  }

  // Summary footer
  const saldoAwalMatch = text.match(/SALDO AWAL\s*:?\s*([\d,]+\.\d{2})/i);
  if (saldoAwalMatch) meta.openingBalance = parseAmount(saldoAwalMatch[1]);

  const saldoAkhirMatch = text.match(/SALDO AKHIR\s*:?\s*([\d,]+\.\d{2})/i);
  if (saldoAkhirMatch) meta.closingBalance = parseAmount(saldoAkhirMatch[1]);

  const mutasiCrMatch = text.match(/MUTASI CR\s*:?\s*([\d,]+\.\d{2})/i);
  if (mutasiCrMatch) meta.totalCredit = parseAmount(mutasiCrMatch[1]);

  const mutasiDbMatch = text.match(/MUTASI DB\s*:?\s*([\d,]+\.\d{2})/i);
  if (mutasiDbMatch) meta.totalDebit = parseAmount(mutasiDbMatch[1]);

  // Account name: company name with common business suffixes (CV, PT, TBK, UD)
  const headerEndIdx = text.search(/TANGGAL\s+KETERANGAN/i);
  const headerRegion = headerEndIdx > 0 ? text.slice(0, headerEndIdx) : text.slice(0, 2000);
  const companyMatch = headerRegion.match(
    /\b([A-Z][A-Z\s]{4,}(?:\s+(?:CV|PT\.?|TBK|UD|TBDK))\b)/m,
  );
  if (companyMatch) {
    const candidate = companyMatch[1].trim();
    const isNoise = /(REKENING|GIRO|TABUNGAN|CATATAN|KCP|INDONESIA)\b/i.test(candidate);
    if (!isNoise) meta.accountName = candidate;
  }

  return meta;
}

// Slice full text to the transaction table only (first header → summary footer)
function extractTransactionSection(text: string): string {
  const headerIdx = text.search(/TANGGAL\s+KETERANGAN/i);
  if (headerIdx === -1) return text;
  const headerLineEnd = text.indexOf('\n', headerIdx);
  const start = headerLineEnd !== -1 ? headerLineEnd + 1 : headerIdx;

  const footerIdx = text.search(/SALDO AWAL\s*:/i);
  const end = footerIdx !== -1 && footerIdx > start ? footerIdx : text.length;

  return text.slice(start, end);
}

const SKIP_PATTERNS = [
  /^(TANGGAL|KETERANGAN|CBG|MUTASI|SALDO)\b/i,
  /^(REKENING GIRO|REKENING TABUNGAN)\b/i,
  /^KCP\b/i,
  /^NO\.\s*REKENING\b/i,
  /^(HALAMAN|PERIODE|MATA UANG|CATATAN)\b/i,
  /^•\s/,
  /^-{2,}$/,
];

// DD/MM where MM is a valid month
function isDateLine(line: string): boolean {
  const m = line.match(/^(\d{2})\/(\d{2})\b/);
  if (!m) return false;
  const month = parseInt(m[2]);
  return month >= 1 && month <= 12;
}

function parseTransactions(fullText: string, year: string, openingBalance: number): Transaction[] {
  const AMOUNT_RE = /([\d,]+\.\d{2})/g;

  const txText = extractTransactionSection(fullText);
  const lines = txText.split('\n').map((l) => l.trim()).filter(Boolean);

  type RawBlock = { date: string; lines: string[] };
  const blocks: RawBlock[] = [];
  let current: RawBlock | null = null;

  for (const line of lines) {
    if (SKIP_PATTERNS.some((p) => p.test(line))) continue;

    if (isDateLine(line)) {
      if (current) blocks.push(current);
      const dm = line.match(/^(\d{2}\/\d{2})/);
      current = { date: dm ? `${dm[1]}/${year}` : line, lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);

  type IntermediateTx = Omit<Transaction, 'balance'> & { explicitBalance: number };
  const rawTxs: IntermediateTx[] = [];

  for (const block of blocks) {
    const allText = block.lines.join(' ');

    // Remove "amount DB" patterns and collect debit total
    let debitTotal = 0;
    const textWithoutDebits = allText.replace(/([\d,]+\.\d{2})\s+DB\b/g, (_match, amt) => {
      debitTotal += parseAmount(amt);
      return '';
    });

    const remainingAmounts = [...textWithoutDebits.matchAll(AMOUNT_RE)].map((m) =>
      parseAmount(m[1]),
    );

    if (debitTotal === 0 && remainingAmounts.length === 0) continue;

    const debit = debitTotal > 0 ? debitTotal : null;
    let credit: number | null = null;
    let explicitBalance = 0;

    if (!debit) {
      // Credit transaction
      if (remainingAmounts.length >= 2) {
        credit = remainingAmounts[remainingAmounts.length - 2];
        explicitBalance = remainingAmounts[remainingAmounts.length - 1];
      } else if (remainingAmounts.length === 1) {
        credit = remainingAmounts[0];
      }
    } else {
      // Debit transaction — remaining amounts are the saldo
      if (remainingAmounts.length > 0) {
        explicitBalance = remainingAmounts[remainingAmounts.length - 1];
      }
    }

    const remark = allText
      .replace(/^\d{2}\/\d{2}\s*/, '')
      .replace(/([\d,]+\.\d{2})\s+DB\b/g, '')
      .replace(/([\d,]+\.\d{2})/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    rawTxs.push({
      postingDate: block.date,
      remark,
      referenceNo: '-',
      debit,
      credit,
      explicitBalance,
    });
  }

  // Compute running balance; use explicit balance as anchor when available
  let runningBalance = openingBalance;
  return rawTxs.map((tx) => {
    runningBalance = runningBalance + (tx.credit ?? 0) - (tx.debit ?? 0);
    if (tx.explicitBalance > 0) runningBalance = tx.explicitBalance;
    const { explicitBalance: _, ...rest } = tx;
    return { ...rest, balance: tx.explicitBalance > 0 ? tx.explicitBalance : runningBalance };
  });
}

export const bcaParser: BankParser = {
  bankName: 'BCA',

  detect(rawText: string): boolean {
    const text = rawText.toLowerCase();
    const hasRkDoc = text.includes('rekening giro') || text.includes('rekening tabungan');
    const hasBcaSummary = text.includes('saldo awal') && text.includes('saldo akhir');
    const hasBcaKeyword = text.includes('bank central asia') || text.includes('bca');
    return hasBcaKeyword && (hasRkDoc || hasBcaSummary);
  },

  parse(pages: string[]): ParseResult {
    try {
      const fullText = pages.join('\n');
      const meta = extractMetadata(fullText);
      const year = extractYearFromPeriode(fullText);
      const openingBalance = meta.openingBalance ?? 0;
      const transactions = parseTransactions(fullText, year, openingBalance);

      if (transactions.length === 0) {
        return {
          success: false,
          error: 'Tidak ada transaksi yang berhasil di-parse dari PDF BCA.',
        };
      }

      const statement: BankStatement = {
        bankName: 'BCA',
        accountNo: meta.accountNo || '-',
        accountName: meta.accountName || '-',
        currency: meta.currency || 'IDR',
        branch: meta.branch || '-',
        periodStart: meta.periodStart || '-',
        periodEnd: meta.periodEnd || '-',
        openingBalance,
        closingBalance: meta.closingBalance ?? 0,
        totalDebit: meta.totalDebit ?? 0,
        totalCredit: meta.totalCredit ?? 0,
        transactions,
        sourceFile: '',
      };

      return { success: true, data: statement };
    } catch (err) {
      return {
        success: false,
        error: `Gagal parse PDF BCA: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
};
