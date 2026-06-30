import type { BankParser, BankStatement, ParseResult, Transaction } from './types';

function parseAmount(str: string): number {
  if (!str || str.trim() === '' || str.trim() === '-') return 0;
  return parseFloat(str.replace(/,/g, '')) || 0;
}

// DD/MM/YY → DD/MM/YYYY
function normalizeDate(raw: string): string {
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{2})/);
  if (!m) return raw.trim();
  return `${m[1]}/${m[2]}/20${m[3]}`;
}

function isDateLine(line: string): boolean {
  return /^\d{2}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}/.test(line);
}

const SKIP_PATTERNS = [
  /^(TIME|REMARK|DEBET|CREDIT|TELLER)\b/i,
  /^(OPENING BALANCE|TOTAL DEBET|TOTAL CREDIT|CLOSING BALANCE)\b/i,
  /^(Account Statement|Account No|Account Name|Account Status|Today Hold Balance|Period|Last Update)\b/i,
  /^(PT\.\s+BANK|Jl\.|Telp\.)\b/i,
  /^\d+\s+dari\s+\d+$/i,
];

function extractSection(text: string): string {
  // Start after column header "TIME REMARK DEBET CREDIT"
  const headerIdx = text.search(/\bTIME\b.*\bREMARK\b.*\bDEBET\b/i);
  if (headerIdx === -1) return text;
  const headerLineEnd = text.indexOf('\n', headerIdx);
  const start = headerLineEnd !== -1 ? headerLineEnd + 1 : headerIdx;

  // End before summary footer
  const footerIdx = text.search(/\bOPENING BALANCE\b.*\bTOTAL DEBET\b/i);
  const end = footerIdx !== -1 && footerIdx > start ? footerIdx : text.length;

  return text.slice(start, end);
}

function extractMetadata(text: string): Partial<BankStatement> {
  const meta: Partial<BankStatement> = {};

  meta.currency = 'IDR';

  const accountNoMatch = text.match(/Account No\s*:\s*([\d-]+)/i);
  if (accountNoMatch) meta.accountNo = accountNoMatch[1].trim();

  const accountNameMatch = text.match(/Account Name\s*:\s*(.+)/i);
  if (accountNameMatch) meta.accountName = accountNameMatch[1].trim();

  const periodMatch = text.match(
    /Period\s*:\s*(\d{2}\/\d{2}\/\d{4})\s*[-–]\s*(\d{2}\/\d{2}\/\d{4})/i,
  );
  if (periodMatch) {
    meta.periodStart = periodMatch[1];
    meta.periodEnd = periodMatch[2];
  }

  // Footer summary row: 4 amounts in order opening, totalDebit, totalCredit, closing
  const summaryMatch = text.match(
    /OPENING BALANCE.*?CLOSING BALANCE[^\n]*\n\s*([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/is,
  );
  if (summaryMatch) {
    meta.openingBalance = parseAmount(summaryMatch[1]);
    meta.totalDebit = parseAmount(summaryMatch[2]);
    meta.totalCredit = parseAmount(summaryMatch[3]);
    meta.closingBalance = parseAmount(summaryMatch[4]);
  }

  return meta;
}

function parseTransactions(fullText: string, openingBalance: number): Transaction[] {
  const AMOUNT_RE = /([\d,]+\.\d{2})/g;
  const txText = extractSection(fullText);
  const lines = txText.split('\n').map((l) => l.trim()).filter(Boolean);

  type Block = { date: string; lines: string[] };
  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const line of lines) {
    if (SKIP_PATTERNS.some((p) => p.test(line))) continue;

    if (isDateLine(line)) {
      if (current) blocks.push(current);
      current = { date: normalizeDate(line), lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);

  const rawTransactions: Omit<Transaction, 'balance'>[] = [];

  for (const block of blocks) {
    const allText = block.lines.join(' ');
    const amounts = [...allText.matchAll(AMOUNT_RE)].map((m) => parseAmount(m[1]));
    if (amounts.length < 2) continue;

    // Last 2 decimal amounts = DEBET, CREDIT (TELLER ID has no decimal)
    const debit = amounts[amounts.length - 2];
    const credit = amounts[amounts.length - 1];

    const remark = allText
      .replace(/^\d{2}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}\s*/g, '')
      .replace(/([\d,]+\.\d{2})/g, '')
      .replace(/\b\d{4,7}\b/g, '') // strip teller IDs (4-7 digit integers)
      .replace(/\s{2,}/g, ' ')
      .trim();

    rawTransactions.push({
      postingDate: block.date,
      remark,
      referenceNo: '-',
      debit: debit > 0 ? debit : null,
      credit: credit > 0 ? credit : null,
    });
  }

  // PDF lists newest-first; reverse to chronological order before computing balance
  rawTransactions.reverse();

  let runningBalance = openingBalance;
  const transactions: Transaction[] = rawTransactions.map((tx) => {
    runningBalance = runningBalance + (tx.credit ?? 0) - (tx.debit ?? 0);
    return { ...tx, balance: runningBalance };
  });

  return transactions;
}

export const briParser: BankParser = {
  bankName: 'BRI',

  detect(rawText: string): boolean {
    const text = rawText.toLowerCase();
    return (
      (text.includes('bank rakyat indonesia') || text.includes('bank bri')) &&
      (text.includes('opening balance') || text.includes('account statement'))
    );
  },

  parse(pages: string[]): ParseResult {
    try {
      const fullText = pages.join('\n');
      const meta = extractMetadata(fullText);
      const openingBalance = meta.openingBalance ?? 0;
      const transactions = parseTransactions(fullText, openingBalance);

      if (transactions.length === 0) {
        return {
          success: false,
          error: 'Tidak ada transaksi yang berhasil di-parse dari PDF BRI.',
        };
      }

      const statement: BankStatement = {
        bankName: 'BRI',
        accountNo: meta.accountNo || '-',
        accountName: meta.accountName || '-',
        currency: meta.currency || 'IDR',
        branch: '-',
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
        error: `Gagal parse PDF BRI: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
};
