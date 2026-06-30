import type { BankParser, BankStatement, ParseResult, Transaction } from './types';

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function parseAmount(str: string): number {
  if (!str || str.trim() === '' || str.trim() === '-') return 0;
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function normalizeDate(raw: string): string {
  // Format: "08/01/2025" atau "08/01/2025 12:10:"
  const slashMatch = raw.match(/(\d{2}\/\d{2}\/\d{4})/);
  if (slashMatch) return slashMatch[1];

  // Format: "01 Feb 2025" atau "01 Feb 2025,"
  const longMatch = raw.match(
    /(\d{2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i,
  );
  if (longMatch) {
    const month = MONTH_MAP[longMatch[2].toLowerCase()] ?? '01';
    return `${longMatch[1]}/${month}/${longMatch[3]}`;
  }

  return raw.trim();
}

function isDateLine(line: string): boolean {
  // Exclude period ranges: "01 Feb 2025 - 28 Feb 2025" atau "01 Jan 2025 - 31 Jan 2025"
  if (/\d{4}\s*[-–]\s*\d{2}/.test(line)) return false;
  // "01 Feb 2025" format (Kopra)
  if (/^\d{2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i.test(line)) return true;
  // "08/01/2025" atau "08/01/2025 12:10:" format (Laporan RK lama)
  if (/^\d{2}\/\d{2}\/\d{4}/.test(line)) return true;
  return false;
}

// Potong teks hanya bagian tabel transaksi (antara header tabel dan footer ringkasan).
// Ini mencegah angka-angka footer masuk ke blok transaksi terakhir.
function extractTransactionSection(text: string): string {
  // Cari awal: baris setelah header tabel "Posting Date ... Balance"
  const headerIdx = text.search(/posting\s+date/i);
  if (headerIdx === -1) return text;
  const headerLineEnd = text.indexOf('\n', headerIdx);
  const start = headerLineEnd !== -1 ? headerLineEnd + 1 : headerIdx;

  // Cari akhir: sebelum ringkasan footer.
  // "For further..." TIDAK masuk di sini — marker itu muncul di tiap footer halaman
  // dan akan memotong teks setelah halaman 1 saja. SKIP_PATTERNS sudah menanganinya.
  const FOOTER_MARKERS = [
    /\bTotal Amount Debited\b/i,
    /\bTotal Amount Credited\b/i,
    /\bNo\.?\s+of\s+Debit\b/i,
    /\bNo of Debit\b/i,
    /\bClosing Balance\b/i,
  ];

  let end = text.length;
  for (const marker of FOOTER_MARKERS) {
    const idx = text.search(marker);
    if (idx !== -1 && idx > start && idx < end) {
      end = idx;
    }
  }

  return text.slice(start, end);
}

function extractMetadata(text: string): Partial<BankStatement> {
  const meta: Partial<BankStatement> = {};

  // No rekening: 13 digit berurutan
  const accountMatch = text.match(/\b(\d{13})\b/);
  if (accountMatch) meta.accountNo = accountMatch[1];

  // Currency
  if (/\bIDR\b/.test(text)) meta.currency = 'IDR';

  // Periode: "01 Feb 2025 - 28 Feb 2025" atau "01 Jan 2025 - 31 Jan 2025"
  const periodLong = text.match(
    /(\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})\s*[-–]\s*(\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i,
  );
  if (periodLong) {
    meta.periodStart = normalizeDate(periodLong[1]);
    meta.periodEnd = normalizeDate(periodLong[2]);
  } else {
    const periodSlash = text.match(/(\d{2}\/\d{2}\/\d{4})\s*[-–]\s*(\d{2}\/\d{2}\/\d{4})/);
    if (periodSlash) {
      meta.periodStart = periodSlash[1];
      meta.periodEnd = periodSlash[2];
    }
  }

  // Branch:
  // Format lama (sama baris): "Branch KCP Samarinda Irian"
  // Format Kopra (baris terpisah): "Period Currency Branch\n01 Feb 2025... IDR AREA SAMARINDA"
  const branchMatch =
    text.match(/\bBranch\b\s+([A-Z][^\n]+)/i) ||               // sama baris ("Branch KCP...")
    text.match(/\bBranch\b[^\n]*\n\s*([A-Z][^\n]+)/i) ||      // baris berikutnya
    text.match(/\bIDR\s+([A-Z][^\n]+)/);                        // fallback Kopra ("IDR AREA SAMARINDA")
  if (branchMatch) meta.branch = branchMatch[1].trim();

  // Summary section — dua format layout tabel:
  //
  // Format A (Kopra): label+nilai di dua baris terpisah (label dan nilai bersebelahan di PDF)
  //   "Opening Balance No. of Debit Total Amount Debited"
  //   "2,463,882,682.19 102 3,926,645,966.55"
  //
  // Format B (Laporan RK lama): nilai langsung di baris label atau di bawahnya
  //   "Opening Balance 4,638,962,172.09"
  //   "Total Amount Debited 1,895,729,699.30"

  const debitSummary = text.match(
    /Opening Balance[^\n]+Total Amount Debited\n\s*([\d,]+\.\d{2})\s+[\d,.]+\s+([\d,]+\.\d{2})/i,
  );
  if (debitSummary) {
    meta.openingBalance = parseAmount(debitSummary[1]);
    meta.totalDebit = parseAmount(debitSummary[2]);
  } else {
    const ob = text.match(/Opening Balance\s+([\d,]+\.\d{2})/i);
    if (ob) meta.openingBalance = parseAmount(ob[1]);
    const td =
      text.match(/Total Amount Debited\s+([\d,]+\.\d{2})/i) ||
      text.match(/Total Amount Debited[^\n]*\n\s*([\d,]+\.\d{2})/i);
    if (td) meta.totalDebit = parseAmount(td[1]);
  }

  const creditSummary = text.match(
    /Closing Balance[^\n]+Total Amount Credited\n\s*([\d,]+\.\d{2})\s+[\d,.]+\s+([\d,]+\.\d{2})/i,
  );
  if (creditSummary) {
    meta.closingBalance = parseAmount(creditSummary[1]);
    meta.totalCredit = parseAmount(creditSummary[2]);
  } else {
    const cb =
      text.match(/Closing Balance\s+([\d,]+\.\d{2})/i) ||
      text.match(/Closing Balance[^\n]*\n\s*([\d,]+\.\d{2})/i);
    if (cb) meta.closingBalance = parseAmount(cb[1]);
    const tc =
      text.match(/Total Amount Credited\s+([\d,]+\.\d{2})/i) ||
      text.match(/Total Amount Credited[^\n]*\n\s*([\d,]+\.\d{2})/i);
    if (tc) meta.totalCredit = parseAmount(tc[1]);
  }

  // Account Name:
  // Format Kopra: "<13digit> PRIMA ABADI JAYA PRIMA ABADI JAYA" (nama = alias)
  // Format lama : "<13digit> IDR ABADI JAYA ABADI JAYA" (currency dulu, lalu nama = alias)
  if (meta.accountNo) {
    const nameLineMatch = text.match(
      new RegExp(`${meta.accountNo}\\s+([A-Z].+?)(?:\\n|$)`, 'm'),
    );
    if (nameLineMatch) {
      let rest = nameLineMatch[1].trim();
      // Hapus kode currency 3 huruf di awal (e.g. "IDR ")
      rest = rest.replace(/^[A-Z]{3}\s+/, '');
      // Jika nama diulang sebagai alias, ambil setengah pertama
      const words = rest.split(/\s+/);
      const mid = Math.floor(words.length / 2);
      const first = words.slice(0, mid).join(' ');
      const second = words.slice(mid).join(' ');
      meta.accountName = first === second && first.length > 0 ? first : rest;
    }
  }

  return meta;
}

const SKIP_PATTERNS = [
  /^(Posting Date|Remark|Reference No|Debit|Credit|Balance)\b/i,
  /^(Total Amount|Closing Balance|Opening Balance|No\.?\s+of|No of)\b/i,
  /^(Account Statement|Account Statement Summary|Account No|Account Name|Alias|Laporan Rekening Koran)\b/i,
  /^(Period|Currency|Branch|Created|For further|Page \d|kopra|mandiri)\b/i,
  /^\(Account Statement Report\)/i,
  /^-{2,}$/,
];

function parseTransactions(fullText: string): Transaction[] {
  const transactions: Transaction[] = [];
  const AMOUNT_RE = /([\d,]+\.\d{2})/g;

  // Batasi ke bagian tabel transaksi saja (agar footer tidak tercemar)
  const txText = extractTransactionSection(fullText);
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

  for (const block of blocks) {
    const allText = block.lines.join(' ');

    const amounts = [...allText.matchAll(AMOUNT_RE)].map((m) => parseAmount(m[1]));
    if (amounts.length < 3) continue;

    // 3 angka terakhir = debit, credit, balance
    const [debit, credit, balance] = amounts.slice(-3);

    const remark = allText
      .replace(/\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}[,\s]*/gi, '')
      .replace(/\d{2}\/\d{2}\/\d{4}[\s\d:.]*/g, '')
      .replace(/\b\d{2}:\d{2}:?\s*\d{0,2}\b/g, '')
      .replace(/([\d,]+\.\d{2})/g, '')
      .replace(/\s-\s/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    transactions.push({
      postingDate: block.date,
      remark,
      referenceNo: '-',
      debit: debit > 0 ? debit : null,
      credit: credit > 0 ? credit : null,
      balance,
    });
  }

  return transactions;
}

export const mandiriParser: BankParser = {
  bankName: 'Mandiri',

  detect(rawText: string): boolean {
    const text = rawText.toLowerCase();
    // Deteksi kedua format Mandiri:
    // - "Account Statement" / "Kopra" (format baru via Kopra by Mandiri)
    // - "Laporan Rekening Koran" / "Account Statement Report" (format lama)
    const hasMandiriSignature =
      text.includes('mandiri') ||
      text.includes('kopra') ||
      text.includes('laporan rekening koran') ||
      text.includes('account statement report');
    return hasMandiriSignature && text.includes('posting date');
  },

  parse(pages: string[]): ParseResult {
    try {
      const fullText = pages.join('\n');
      const meta = extractMetadata(fullText);
      const transactions = parseTransactions(fullText);

      if (transactions.length === 0) {
        return {
          success: false,
          error: 'Tidak ada transaksi yang berhasil di-parse dari PDF Mandiri.',
        };
      }

      const statement: BankStatement = {
        bankName: 'Mandiri',
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
        error: `Gagal parse PDF Mandiri: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
};
