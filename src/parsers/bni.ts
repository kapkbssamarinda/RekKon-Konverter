import type { BankParser, BankStatement, ParseResult, Transaction } from './types';

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function parseAmount(str: string): number {
  if (!str || str.trim() === '') return 0;
  return parseFloat(str.replace(/,/g, '')) || 0;
}

// "09/04/2025 09.33.04" → "09/04/2025"
function normalizeBNIDate(raw: string): string {
  const m = raw.match(/(\d{2}\/\d{2}\/\d{4})/);
  return m ? m[1] : raw.trim();
}

// "01-Apr-25" → "01/04/2025"
function normalizePeriodDate(raw: string): string {
  const m = raw.match(/(\d{2})-(\w{3})-(\d{2})/i);
  if (!m) return raw;
  const month = MONTH_MAP[m[2].toLowerCase()] ?? '01';
  const year = 2000 + parseInt(m[3]);
  return `${m[1]}/${month}/${year}`;
}

// BNI date: DD/MM/YYYY diikuti waktu bertitik (bukan titik dua)
function isDateLine(line: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}\s+\d{2}\.\d{2}\.\d{2}/.test(line);
}

const SKIP_PATTERNS = [
  /^(Posting\s+Date|Effective\s+Date|Transaction\s+Description|Amount|DB\/CR|Balance)\b/i,
  /^(Account\s+Information|Account\s+Statement)\b/i,
  /^(Account\s+No|Account\s+Type|Page)\b/i,
  /^(Branch\s+Journal|Branch)\s*$/i,
  /^Ledger\s+Balance\b/i,
];

// Penanda akhir periode — flush blok aktif lalu reset ke null
// Reset ke null agar baris header periode berikutnya diabaikan
const PERIOD_END = /^(Ending\s+Balance|Total\s+Debet|Total\s+Credit)\b/i;

function extractMetadata(text: string): Partial<BankStatement> {
  const meta: Partial<BankStatement> = {};

  // Account No + Name + Currency dari: "2244665758 / PT KARUNIA MAKMUR UTAMA(IDR)"
  const accLine = text.match(/(\d{7,15})\s*\/\s*(.+?)\s*\(\s*(IDR|USD|EUR)\s*\)/i);
  if (accLine) {
    meta.accountNo = accLine[1];
    meta.accountName = accLine[2].trim();
    meta.currency = accLine[3].toUpperCase();
  }

  // Gunakan \s+ antar kata untuk toleransi spasi ganda akibat join pdfjs text items
  // Opening: Ledger Balance pertama dari semua periode
  const ledgerBals = [...text.matchAll(/Ledger\s+Balance\s*[:\s]*([\d,]+\.\d{2})/gi)];
  if (ledgerBals.length > 0) meta.openingBalance = parseAmount(ledgerBals[0][1]);

  // Closing: Ending Balance terakhir dari semua periode
  const endingBals = [...text.matchAll(/Ending\s+Balance\s*[:\s]*([\d,]+\.\d{2})/gi)];
  if (endingBals.length > 0) meta.closingBalance = parseAmount(endingBals[endingBals.length - 1][1]);

  // Jumlahkan Total Debet dan Total Credit dari setiap periode
  // Format: "Total Debet : 7 23,548,676.00" (count lalu amount)
  const totalDebets = [...text.matchAll(/Total\s+Debet\s*:\s*\d+\s*([\d,]+\.\d{2})/gi)];
  const totalCredits = [...text.matchAll(/Total\s+Credit\s*:\s*\d+\s*([\d,]+\.\d{2})/gi)];
  meta.totalDebit = totalDebets.reduce((s, m) => s + parseAmount(m[1]), 0);
  meta.totalCredit = totalCredits.reduce((s, m) => s + parseAmount(m[1]), 0);

  // Period: "01-Apr-25 - 30-Apr-25" — paling awal (start) dan paling akhir (end)
  const periods = [...text.matchAll(/(\d{2}-\w{3}-\d{2})\s*[-–]\s*(\d{2}-\w{3}-\d{2})/gi)];
  if (periods.length > 0) {
    meta.periodStart = normalizePeriodDate(periods[0][1]);
    meta.periodEnd = normalizePeriodDate(periods[periods.length - 1][2]);
  }

  meta.branch = '-';

  return meta;
}

function buildRemark(allText: string): string {
  return allText
    .replace(/\d{2}\/\d{2}\/\d{4}\s+\d{2}\.\d{2}\.\d{2}/g, '')
    .replace(/([\d,]+\.\d{2})/g, '')
    .replace(/\b\d+\s+[DK]\b/g, '')
    .replace(/\b[DK]\b/g, '')
    .replace(/\b\d{6}\b/g, '')
    .replace(/INTERNAL\s+BRANCH/gi, '')
    .replace(/DIVISI\s+OPERASI\w*/gi, '')
    .replace(/\bNAL\b/g, '')
    .replace(/UNIT\s+E[-\s]*CHANNEL\s*(?:\(ECN\))?/gi, '')
    .replace(/\(ECN\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseTransactions(fullText: string, openingBalance: number): Transaction[] {
  const transactions: Transaction[] = [];
  const lines = fullText.split('\n').map((l) => l.trim()).filter(Boolean);

  type Block = { date: string; lines: string[] };
  let current: Block | null = null;

  function flushBlock() {
    if (!current) return;
    const { date, lines: blockLines } = current;
    current = null;

    const allText = blockLines.join(' ');

    // Cari semua kemunculan D atau K sebagai kata tersendiri (word boundary)
    // Ini menghindari false match pada kata seperti "DIVISI", "DARI", "KARUNIA", "KE"
    const dkMatches = [...allText.matchAll(/\b([DK])\b/g)];
    if (dkMatches.length === 0) return;

    // Iterasi semua match, simpan yang terakhir valid
    // (indikator D/K asli ada di posisi akhir blok, setelah jumlah transaksi)
    let found: { type: 'D' | 'K'; amount: number; balance: number } | null = null;

    for (const m of dkMatches) {
      if (m.index === undefined) continue;
      const beforeDK = allText.slice(0, m.index);
      const afterDK = allText.slice(m.index + 1);

      // Amount: angka desimal pertama dari kanan sebelum D/K
      // PDF BNI menyisipkan field "0.00" di antara amount dan K:
      //   "30,289.00 0.00   K" → amount=30,289.00, bukan 0.00
      // (?:\s+[\d,]+\.\d{2})* menangkap satu atau lebih desimal tambahan sebelum D/K
      // Leftmost match (match() JS) memastikan amount pertama (terbesar) yang diambil
      const amtMatch = beforeDK.match(/([\d,]+\.\d{2})(?:\s+[\d,]+\.\d{2})*\s+(?:\d+\s+)?$/);
      if (!amtMatch) continue;

      const amount = parseAmount(amtMatch[1]);

      // Balance: angka desimal pertama setelah D/K (kosong pada BY ADMINISTRASI)
      const balMatch = afterDK.match(/^\s*([\d,]+\.\d{2})/);
      const balance = balMatch ? parseAmount(balMatch[1]) : 0;

      found = { type: m[1] as 'D' | 'K', amount, balance };
    }

    if (!found) return;

    const journalMatch = allText.match(/\b(\d{6})\b(?!\.\d)/);

    transactions.push({
      postingDate: date,
      remark: buildRemark(allText),
      referenceNo: journalMatch ? journalMatch[1] : '-',
      debit: found.type === 'D' ? found.amount : null,
      credit: found.type === 'K' ? found.amount : null,
      balance: found.balance,
    });
  }

  for (const line of lines) {
    if (PERIOD_END.test(line)) {
      flushBlock();
      continue;
    }

    if (SKIP_PATTERNS.some((p) => p.test(line))) continue;

    if (isDateLine(line)) {
      flushBlock();
      current = { date: normalizeBNIDate(line), lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  flushBlock();

  // Post-processing: isi balance = 0 (kasus BY ADMINISTRASI — kolom Balance kosong di PDF)
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].balance === 0) {
      const prevBal = i > 0 ? transactions[i - 1].balance : openingBalance;
      const tx = transactions[i];
      if (tx.debit !== null) tx.balance = prevBal - tx.debit;
      else if (tx.credit !== null) tx.balance = prevBal + tx.credit;
    }
  }

  return transactions;
}

export const bniParser: BankParser = {
  bankName: 'BNI',

  detect(rawText: string): boolean {
    const text = rawText.toLowerCase();
    // Gunakan regex untuk toleransi spasi ganda antar kata
    return /ledger\s+balance/.test(text) &&
      /ending\s+balance/.test(text) &&
      /posting\s+date/.test(text);
  },

  parse(pages: string[]): ParseResult {
    try {
      const fullText = pages.join('\n');
      const meta = extractMetadata(fullText);
      const transactions = parseTransactions(fullText, meta.openingBalance ?? 0);

      if (transactions.length === 0) {
        return {
          success: false,
          error: 'Tidak ada transaksi yang berhasil di-parse dari PDF BNI.',
        };
      }

      const statement: BankStatement = {
        bankName: 'BNI',
        accountNo: meta.accountNo || '-',
        accountName: meta.accountName || '-',
        currency: meta.currency || 'IDR',
        branch: meta.branch || '-',
        periodStart: meta.periodStart || '-',
        periodEnd: meta.periodEnd || '-',
        openingBalance: meta.openingBalance ?? 0,
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
        error: `Gagal parse PDF BNI: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
};
