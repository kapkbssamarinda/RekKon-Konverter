# PRD: RekKoran Converter
**PDF Rekening Koran → Excel · Client-Side Web App**
**Untuk Claude Code — Local Development**

---

## 1. Ringkasan Proyek

Web app **client-side murni** (tidak ada backend/server) untuk mengkonversi PDF rekening koran bank Indonesia menjadi satu file Excel gabungan. Semua pemrosesan terjadi di browser pengguna — PDF tidak pernah dikirim ke server manapun.

**Stack:**
- Vite + React 18 + TypeScript
- Tailwind CSS v3
- Google Fonts: Figtree + DM Sans + Roboto Mono (TouchFlow Design System)
- `pdfjs-dist` — parsing PDF di browser
- `xlsx` (SheetJS) — generate file Excel
- Hosting target: Vercel / GitHub Pages (static export)

---

## 2. Design System — TouchFlow

Implementasikan **TouchFlow** secara konsisten di seluruh app.

### 2.1 Warna (CSS custom properties di `index.css`)

```css
:root {
  --color-primary:    #3B82F6;
  --color-primary-dk: #2563EB;
  --color-secondary:  #F97171;
  --color-tertiary:   #34D399;
  --color-bg:         #FFFFFF;
  --color-surface:    #F9FAFB;
  --color-success:    #34D399;
  --color-warning:    #FBBF24;
  --color-error:      #EF4444;
  --color-error-dk:   #DC2626;
  --color-info:       #3B82F6;

  --color-text-primary:   #111827;
  --color-text-secondary: #6B7280;
  --color-text-disabled:  #D1D5DB;

  --color-border-default: #E5E7EB;
  --color-border-strong:  #D1D5DB;
  --color-divider:        #F3F4F6;

  --shadow-subtle: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-medium: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-large:  0 8px 24px rgba(0,0,0,0.12);
}
```

### 2.2 Tipografi

Import dari Google Fonts:
```
Figtree: 400, 600, 700
DM Sans: 400, 500
Roboto Mono: 400
```

Kelas Tailwind custom di `tailwind.config.ts`:
```ts
fontFamily: {
  headline: ['Figtree', 'sans-serif'],
  body:     ['DM Sans', 'sans-serif'],
  mono:     ['Roboto Mono', 'monospace'],
}
```

Gunakan:
- Heading app: `font-headline font-bold text-2xl` (Figtree 24px bold)
- Subhead: `font-headline font-semibold text-xl` (Figtree 20px semibold)
- Body: `font-body text-[15px]` (DM Sans 15px)
- Caption: `font-body font-medium text-[12px]` (DM Sans 12px medium)
- Angka transaksi: `font-mono text-[13px]` (Roboto Mono)

### 2.3 Spacing & Radius

Spacing base 6px, gunakan kelipatan 6:
- Section antar major: `gap-9` (36px)
- Antar grup related: `gap-[18px]`
- Padding komponen default: `px-[18px] py-[18px]`

Border radius:
- Chip/badge: `rounded-lg` (8px)
- Input/small card: `rounded-xl` (12px)
- Card/modal: `rounded-2xl` (16px)
- Bottom sheet: `rounded-[24px]`
- Pill/FAB: `rounded-full`

### 2.4 Komponen UI yang Diperlukan

**Button Primary:**
```tsx
className="bg-[#3B82F6] text-white font-body font-medium rounded-2xl
           px-[18px] h-12 active:bg-[#2563EB] transition-colors
           disabled:opacity-40 min-h-[44px]"
```

**Button Secondary:**
```tsx
className="bg-[#F3F4F6] text-[#3B82F6] font-body font-medium rounded-2xl
           px-[18px] h-12 active:bg-[#E5E7EB] transition-colors min-h-[44px]"
```

**Card Default:**
```tsx
className="bg-[#F9FAFB] rounded-2xl p-[18px]"
style={{ boxShadow: 'var(--shadow-subtle)' }}
```

**Chip Filter:**
```tsx
// Aktif
className="bg-[#EFF6FF] text-[#3B82F6] font-body text-[13px] rounded-full px-[14px] py-1.5 min-h-[36px]"
// Inaktif
className="bg-[#F3F4F6] text-[#6B7280] font-body text-[13px] rounded-full px-[14px] py-1.5 min-h-[36px]"
```

**Status Chip:**
```tsx
// Success
className="bg-[#34D399]/12 text-[#059669] font-body text-[12px] rounded-full px-[14px] py-1.5"
// Error/Debit
className="bg-[#EF4444]/12 text-[#EF4444] font-body text-[12px] rounded-full px-[14px] py-1.5"
// Warning
className="bg-[#FBBF24]/12 text-[#D97706] font-body text-[12px] rounded-full px-[14px] py-1.5"
```

---

## 3. Arsitektur Proyek

```
rk-converter/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css              ← CSS custom properties TouchFlow
│   │
│   ├── components/            ← UI Components
│   │   ├── DropZone.tsx
│   │   ├── FileQueue.tsx
│   │   ├── FileQueueItem.tsx
│   │   ├── PreviewTable.tsx
│   │   ├── SummaryBar.tsx
│   │   ├── StepIndicator.tsx
│   │   └── ConfigChips.tsx
│   │
│   ├── parsers/               ← SATU FILE PER BANK — ISOLATED
│   │   ├── index.ts           ← registry & auto-detect
│   │   ├── types.ts           ← shared types/interfaces
│   │   ├── mandiri.ts         ← Parser Bank Mandiri
│   │   ├── bri.ts             ← Parser BRI (stub kosong, siap diisi)
│   │   ├── bca.ts             ← Parser BCA (stub kosong)
│   │   ├── bni.ts             ← Parser BNI (stub kosong)
│   │   ├── smbc.ts            ← Parser SMBC (stub kosong)
│   │   └── kopra.ts           ← Parser Kopra (stub kosong)
│   │
│   ├── services/
│   │   ├── pdfReader.ts       ← pdfjs-dist wrapper (ekstrak teks per halaman)
│   │   └── excelExporter.ts   ← SheetJS: buat Excel gabungan + sheet per bank
│   │
│   └── hooks/
│       ├── useFileProcessor.ts ← state machine: idle→queued→processing→done→error
│       └── useAppStore.ts      ← Zustand store (atau useState sederhana)
│
├── public/
│   └── pdf.worker.min.mjs     ← pdfjs worker (copy dari node_modules)
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 4. Shared Types (`src/parsers/types.ts`)

```ts
export interface Transaction {
  postingDate: string;      // "DD/MM/YYYY" normalized
  remark: string;           // deskripsi transaksi
  referenceNo: string;      // nomor referensi
  debit: number | null;     // null jika bukan debit
  credit: number | null;    // null jika bukan kredit
  balance: number;
}

export interface BankStatement {
  bankName: string;         // "Mandiri" | "BRI" | "BCA" | dll
  accountNo: string;
  accountName: string;
  currency: string;
  branch: string;
  periodStart: string;      // "DD/MM/YYYY"
  periodEnd: string;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  transactions: Transaction[];
  sourceFile: string;       // nama file asli PDF
}

export interface ParseResult {
  success: boolean;
  data?: BankStatement;
  error?: string;
}

export interface BankParser {
  bankName: string;
  detect: (rawText: string) => boolean;  // return true jika PDF ini milik bank ini
  parse: (pages: string[]) => ParseResult;
}
```

---

## 5. Parser Registry (`src/parsers/index.ts`)

```ts
import { mandiriParser } from './mandiri';
import { briParser } from './bri';
import { bcaParser } from './bca';
import { bniParser } from './bni';
import { smbcParser } from './smbc';
import { kopraParser } from './kopra';
import { BankParser, ParseResult } from './types';

const PARSERS: BankParser[] = [
  mandiriParser,
  briParser,
  bcaParser,
  bniParser,
  smbcParser,
  kopraParser,
];

export function detectAndParse(pages: string[]): ParseResult {
  const combinedText = pages.join('\n');
  
  for (const parser of PARSERS) {
    if (parser.detect(combinedText)) {
      return parser.parse(pages);
    }
  }
  
  return {
    success: false,
    error: 'Bank tidak dikenali. Pastikan PDF adalah rekening koran yang didukung.',
  };
}
```

---

## 6. Parser Mandiri — Implementasi Lengkap (`src/parsers/mandiri.ts`)

Berdasarkan analisis PDF sample (`RK_Mandiri_AJ_Januari_2025.pdf`):

### Struktur PDF Mandiri:
- **Header halaman 1:** "Laporan Rekening Koran" / "Account Statement Report" + logo Mandiri
- **Metadata:** Account No, Period, Currency, Branch, Opening Balance
- **Kolom transaksi:** Posting Date | Remark | Reference No | Debit | Credit | Balance
- **Format tanggal:** `DD/MM/YYYY HH:MM:SS` (contoh: `08/01/2025 12:10:50`)
- **Format angka:** `1,234,567.89` (koma sebagai ribuan, titik sebagai desimal)
- **Footer halaman terakhir:** Total Amount Debited, Total Amount Credited, No of Debit, No of Credit, Closing Balance
- **Tanda debit/kredit:** nilai 0.00 di kolom kredit = debit, nilai 0.00 di kolom debit = kredit

### Implementasi:

```ts
import { BankParser, BankStatement, ParseResult, Transaction } from './types';

const DETECT_KEYWORDS = ['Laporan Rekening Koran', 'Account Statement Report', 'mandiri'];

function parseAmount(str: string): number {
  if (!str || str.trim() === '-' || str.trim() === '') return 0;
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function normalizeDate(raw: string): string {
  // Input: "08/01/2025 12:10:50" atau "08/01/2025"
  // Output: "08/01/2025"
  const match = raw.match(/(\d{2}\/\d{2}\/\d{4})/);
  return match ? match[1] : raw.trim();
}

function extractMetadata(text: string): Partial<BankStatement> {
  const meta: Partial<BankStatement> = {};

  const accountMatch = text.match(/Account No\s+([\d\s]+IDR\s+\S+)/i);
  if (accountMatch) {
    const parts = accountMatch[1].split(/\s+/);
    meta.accountNo = parts[0];
    meta.currency = parts[1] || 'IDR';
  }

  const periodMatch = text.match(/Period\s+(\d{2}\s+\w+\s+\d{4})\s*-\s*(\d{2}\s+\w+\s+\d{4})/i)
    || text.match(/Period\s+(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/i);
  if (periodMatch) {
    meta.periodStart = periodMatch[1];
    meta.periodEnd = periodMatch[2];
  }

  const branchMatch = text.match(/Branch\s+(.+?)(?:\n|$)/i);
  if (branchMatch) meta.branch = branchMatch[1].trim();

  const openingMatch = text.match(/Opening Balance\s+([\d,]+\.\d{2})/i);
  if (openingMatch) meta.openingBalance = parseAmount(openingMatch[1]);

  const closingMatch = text.match(/Closing Balance\s+([\d,]+\.\d{2})/i);
  if (closingMatch) meta.closingBalance = parseAmount(closingMatch[1]);

  const debitedMatch = text.match(/Total Amount Debited\s+([\d,]+\.\d{2})/i);
  if (debitedMatch) meta.totalDebit = parseAmount(debitedMatch[1]);

  const creditedMatch = text.match(/Total Amount Credited\s+([\d,]+\.\d{2})/i);
  if (creditedMatch) meta.totalCredit = parseAmount(creditedMatch[1]);

  // Account name: baris setelah account number (nama perusahaan)
  const nameMatch = text.match(/\d{13}\s+IDR\s+(\S+.*?)(?=\n)/i);
  if (nameMatch) meta.accountName = nameMatch[1].trim();

  return meta;
}

function parseTransactions(fullText: string): Transaction[] {
  const transactions: Transaction[] = [];
  
  // Regex untuk baris transaksi Mandiri
  // Format: DD/MM/YYYY HH:MM:SS ... angka angka angka
  const lines = fullText.split('\n');
  
  // State machine: kumpulkan baris per transaksi
  let currentTx: Partial<Transaction> | null = null;
  let remarkLines: string[] = [];
  
  const datePattern = /^(\d{2}\/\d{2}\/\d{4})\s+\d{2}:\d{2}:\s*\d{2}/;
  // Pattern angka: bisa 0.00 atau 1,234,567.89
  const amountPattern = /([\d,]+\.\d{2})/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip header rows
    if (/^(Posting Date|Remark|Reference|Debit|Credit|Balance|No\s)/.test(trimmed)) continue;
    if (/^(Total Amount|Closing Balance|Opening Balance|No of)/.test(trimmed)) continue;

    const dateMatch = trimmed.match(datePattern);
    
    if (dateMatch) {
      // Simpan transaksi sebelumnya
      if (currentTx && currentTx.balance !== undefined) {
        currentTx.remark = remarkLines.join(' ').trim();
        transactions.push(currentTx as Transaction);
      }

      // Ambil semua angka dari baris ini
      const amounts = [...trimmed.matchAll(amountPattern)].map(m => parseAmount(m[1]));
      // Mandiri: [debit, credit, balance] — semua 3 angka ada di baris
      // Kalau kurang dari 3 angka, baris lanjutan belum selesai

      currentTx = {
        postingDate: normalizeDate(dateMatch[1]),
        remark: '',
        referenceNo: '-',
        debit: null,
        credit: null,
        balance: 0,
      };
      remarkLines = [];

      if (amounts.length >= 3) {
        const [debit, credit, balance] = amounts.slice(-3);
        currentTx.debit = debit > 0 ? debit : null;
        currentTx.credit = credit > 0 ? credit : null;
        currentTx.balance = balance;
        
        // Ambil remark dari antara tanggal dan angka-angka pertama
        const remarkRaw = trimmed
          .replace(datePattern, '')
          .replace(/[\d,]+\.\d{2}/g, '')
          .replace(/-\s*/g, '')
          .trim();
        remarkLines = [remarkRaw];
      }
    } else if (currentTx) {
      // Baris lanjutan remark atau referensi
      remarkLines.push(trimmed);
    }
  }

  // Jangan lupa transaksi terakhir
  if (currentTx && currentTx.balance !== undefined) {
    currentTx.remark = remarkLines.join(' ').trim();
    transactions.push(currentTx as Transaction);
  }

  return transactions;
}

export const mandiriParser: BankParser = {
  bankName: 'Mandiri',

  detect(rawText: string): boolean {
    const text = rawText.toLowerCase();
    return DETECT_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))
      && text.includes('posting date');
  },

  parse(pages: string[]): ParseResult {
    try {
      const fullText = pages.join('\n');
      const meta = extractMetadata(fullText);
      const transactions = parseTransactions(fullText);

      if (transactions.length === 0) {
        return { success: false, error: 'Tidak ada transaksi yang berhasil di-parse dari PDF Mandiri.' };
      }

      const statement: BankStatement = {
        bankName: 'Mandiri',
        accountNo: meta.accountNo || '-',
        accountName: meta.accountName || '-',
        currency: meta.currency || 'IDR',
        branch: meta.branch || '-',
        periodStart: meta.periodStart || '-',
        periodEnd: meta.periodEnd || '-',
        openingBalance: meta.openingBalance || 0,
        closingBalance: meta.closingBalance || 0,
        totalDebit: meta.totalDebit || 0,
        totalCredit: meta.totalCredit || 0,
        transactions,
        sourceFile: '',  // diisi oleh useFileProcessor
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
```

---

## 7. Stub Parser Bank Lain

Setiap file stub berikut siap diisi parser-nya tanpa mengubah file lain:

```ts
// src/parsers/bri.ts
import { BankParser } from './types';
export const briParser: BankParser = {
  bankName: 'BRI',
  detect: (text) => text.toLowerCase().includes('bank rakyat indonesia') || text.includes('BRI'),
  parse: (_pages) => ({ success: false, error: 'Parser BRI belum diimplementasikan.' }),
};

// src/parsers/bca.ts
import { BankParser } from './types';
export const bcaParser: BankParser = {
  bankName: 'BCA',
  detect: (text) => text.toLowerCase().includes('bank central asia') || text.includes('BCA'),
  parse: (_pages) => ({ success: false, error: 'Parser BCA belum diimplementasikan.' }),
};

// Pola sama untuk bni.ts, smbc.ts, kopra.ts
```

---

## 8. PDF Reader Service (`src/services/pdfReader.ts`)

```ts
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path — file harus ada di public/
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface PdfReadResult {
  pages: string[];      // teks tiap halaman
  pageCount: number;
  error?: string;
}

export async function readPdfPages(file: File): Promise<PdfReadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    // Gabungkan item teks dengan whitespace yang preserves posisi kolom
    // Penting untuk parsing tabel rekening koran
    const pageText = content.items
      .map((item: any) => {
        // Tambahkan newline berdasarkan perubahan posisi Y yang signifikan
        return item.str;
      })
      .join(' ');
    
    pages.push(pageText);
  }

  return { pages, pageCount: pdf.numPages };
}
```

> **Catatan penting untuk implementasi:** `pdfjs-dist` mengekstrak teks sebagai array item yang masing-masing punya koordinat X/Y. Untuk parsing tabel rekening koran yang akurat, gunakan koordinat Y untuk mengelompokkan item dalam satu baris, lalu urutkan berdasarkan X. Implementasikan fungsi `groupByY(items, threshold=2)` di pdfReader.ts.

---

## 9. Excel Exporter (`src/services/excelExporter.ts`)

```ts
import * as XLSX from 'xlsx';
import { BankStatement } from '../parsers/types';

const HEADER_STYLE = {
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  fill: { fgColor: { rgb: '3B82F6' } },
  alignment: { horizontal: 'center' },
};

const DEBIT_STYLE = { font: { color: { rgb: 'EF4444' } } };
const CREDIT_STYLE = { font: { color: { rgb: '059669' } } };

export function exportToExcel(statements: BankStatement[]): void {
  const wb = XLSX.utils.book_new();

  // === Sheet 1: GABUNGAN (semua transaksi dari semua file) ===
  const allRows = statements.flatMap(stmt =>
    stmt.transactions.map(tx => ({
      'Tanggal': tx.postingDate,
      'Bank': stmt.bankName,
      'No Rekening': stmt.accountNo,
      'Nama Rekening': stmt.accountName,
      'Keterangan': tx.remark,
      'No Referensi': tx.referenceNo,
      'Debit': tx.debit ?? '',
      'Kredit': tx.credit ?? '',
      'Saldo': tx.balance,
      'Sumber File': stmt.sourceFile,
    }))
  );

  const wsGabungan = XLSX.utils.json_to_sheet(allRows);
  styleSheetHeader(wsGabungan, Object.keys(allRows[0] || {}));
  XLSX.utils.book_append_sheet(wb, wsGabungan, 'Gabungan');

  // === Sheet per bank ===
  const bankGroups = new Map<string, BankStatement[]>();
  for (const stmt of statements) {
    const group = bankGroups.get(stmt.bankName) || [];
    group.push(stmt);
    bankGroups.set(stmt.bankName, group);
  }

  for (const [bankName, stmts] of bankGroups) {
    const rows = stmts.flatMap(stmt =>
      stmt.transactions.map(tx => ({
        'Tanggal': tx.postingDate,
        'No Rekening': stmt.accountNo,
        'Nama Rekening': stmt.accountName,
        'Keterangan': tx.remark,
        'No Referensi': tx.referenceNo,
        'Debit': tx.debit ?? '',
        'Kredit': tx.credit ?? '',
        'Saldo': tx.balance,
        'Sumber File': stmt.sourceFile,
      }))
    );

    const ws = XLSX.utils.json_to_sheet(rows);
    styleSheetHeader(ws, Object.keys(rows[0] || {}));

    // Nama sheet max 31 karakter (batasan Excel)
    const sheetName = bankName.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  // === Sheet Ringkasan ===
  const summaryRows = statements.map(stmt => ({
    'Bank': stmt.bankName,
    'No Rekening': stmt.accountNo,
    'Nama Rekening': stmt.accountName,
    'Cabang': stmt.branch,
    'Periode': `${stmt.periodStart} - ${stmt.periodEnd}`,
    'Saldo Awal': stmt.openingBalance,
    'Total Debit': stmt.totalDebit,
    'Total Kredit': stmt.totalCredit,
    'Saldo Akhir': stmt.closingBalance,
    'Jml Transaksi': stmt.transactions.length,
    'File Sumber': stmt.sourceFile,
  }));

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  styleSheetHeader(wsSummary, Object.keys(summaryRows[0] || {}));
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // Unduh file
  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `RekKoran_Gabungan_${timestamp}.xlsx`);
}

function styleSheetHeader(ws: XLSX.WorkSheet, headers: string[]) {
  // Set lebar kolom otomatis (estimasi)
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 15) }));
}
```

---

## 10. UI — Halaman Utama (`src/App.tsx`)

### Layout & Flow

App terdiri dari satu halaman dengan 3 section vertikal:

```
┌─────────────────────────────────────────────┐
│  HEADER: Logo + nama app + versi            │
├─────────────────────────────────────────────┤
│  STEP INDICATOR: Upload → Proses → Unduh   │
├─────────────────────────────────────────────┤
│  CONFIG CHIPS: Pilihan gabung/pisah, dll    │
├────────────────────┬────────────────────────┤
│  DROP ZONE         │  FILE QUEUE            │
│  (kiri)            │  (kanan)               │
├────────────────────┴────────────────────────┤
│  PREVIEW TABLE (muncul setelah ada hasil)   │
├─────────────────────────────────────────────┤
│  ACTION BAR: Statistik + tombol Unduh Excel │
└─────────────────────────────────────────────┘
```

### State App

```ts
type AppStep = 'upload' | 'processing' | 'done';

interface FileItem {
  id: string;
  file: File;
  status: 'queued' | 'processing' | 'done' | 'error';
  progress: number;          // 0-100
  bankDetected?: string;
  result?: BankStatement;
  errorMsg?: string;
}
```

### Komponen `DropZone`

- Area drag & drop dengan border dashed `#E5E7EB`, background `#F9FAFB`
- Icon: file PDF besar di tengah
- Text: "Drag & drop PDF rekening koran" / "atau klik untuk pilih"
- Accept: `application/pdf` only
- Multiple files diperbolehkan
- Hover state: border `#3B82F6`, background `#EFF6FF`
- Saat drag over: animasi scale 1.01, border solid biru

### Komponen `FileQueueItem`

- Tiap file ditampilkan sebagai row card
- Status chip kanan: Menunggu (abu) | Memproses... (biru animate-pulse) | Selesai ✓ (hijau) | Gagal ✗ (merah)
- Bank chip kiri: nama bank terdeteksi (Mandiri/BRI/BCA/dll) dengan warna khas per bank
- Progress bar tipis (3px) muncul saat status `processing`
- Error message muncul di bawah row jika status `error`
- Tombol × untuk hapus file (kanan)

**Warna chip per bank:**
```ts
const BANK_COLORS: Record<string, { bg: string; text: string }> = {
  'Mandiri': { bg: '#FFF8E1', text: '#F59E0B' },  // kuning Mandiri
  'BRI':     { bg: '#FFEBEE', text: '#EF4444' },  // merah BRI
  'BCA':     { bg: '#E3F2FD', text: '#1E88E5' },  // biru BCA
  'BNI':     { bg: '#F3E5F5', text: '#8E24AA' },  // ungu BNI
  'SMBC':    { bg: '#E8EAF6', text: '#3949AB' },  // navy SMBC
  'Kopra':   { bg: '#E8F5E9', text: '#43A047' },  // hijau Kopra
};
```

### Komponen `PreviewTable`

- Muncul dengan animasi fade-in setelah ada ≥1 file selesai diproses
- Kolom: Tanggal | Bank | Keterangan | Debit | Kredit | Saldo
- Debit: warna merah `#EF4444`, font-mono
- Kredit: warna hijau `#059669`, font-mono
- Saldo: font-mono, text-primary
- Maksimum tampilkan 20 baris, sisanya "...dan X transaksi lainnya"
- Header tabel background `#3B82F6`, teks putih

### Komponen `SummaryBar`

- Fixed di bagian bawah (sticky bottom)
- Kiri: statistik ringkas — N transaksi | N bank | N file
- Kanan: Tombol "Unduh Excel" (primary, disabled jika belum ada hasil)
- Tombol sekunder "Reset" di sebelah kiri tombol unduh

---

## 11. Hook `useFileProcessor`

```ts
export function useFileProcessor() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [statements, setStatements] = useState<BankStatement[]>([]);

  async function processFile(item: FileItem) {
    // 1. Update status → processing
    // 2. readPdfPages(item.file) → dapat pages[]
    // 3. detectAndParse(pages) → ParseResult
    // 4. Jika sukses → update status done, simpan result ke statements[]
    // 5. Jika gagal → update status error, simpan errorMsg
  }

  function addFiles(newFiles: File[]) {
    const items: FileItem[] = newFiles.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      status: 'queued',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...items]);
    // Proses satu per satu (sequential agar tidak membebani browser)
    items.reduce(
      (chain, item) => chain.then(() => processFile(item)),
      Promise.resolve()
    );
  }

  function removeFile(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id));
    // Hapus juga dari statements
  }

  function reset() {
    setFiles([]);
    setStatements([]);
  }

  return { files, statements, addFiles, removeFile, reset };
}
```

---

## 12. Setup & Instalasi

### `package.json` dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "pdfjs-dist": "^4.4.168",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.0",
    "vite": "^5.3.0"
  }
}
```

### Perintah setup awal

```bash
npm create vite@latest rk-converter -- --template react-ts
cd rk-converter
npm install pdfjs-dist xlsx
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Copy pdf.worker ke public/
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
});
```

### `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        headline: ['Figtree', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### `index.html` — Import Google Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700&family=DM+Sans:wght@400;500&family=Roboto+Mono:wght@400&display=swap" rel="stylesheet">
```

---

## 13. Pengujian Lokal

### Test case utama

1. **Happy path Mandiri:** Upload `RK_Mandiri_AJ_Januari_2025.pdf` → harus terdeteksi "Mandiri" → 60 transaksi terparsing → Excel berhasil diunduh dengan 3 sheet (Gabungan, Mandiri, Ringkasan)

2. **Multi-file:** Upload 2-3 PDF sekaligus → semua masuk antrian → diproses sequential → hasil digabung di sheet Gabungan

3. **Bank tidak dikenal:** Upload PDF acak → status error "Bank tidak dikenali"

4. **File bukan PDF:** Drag file `.xlsx` → ditolak di drop zone

5. **Hapus file:** Tambah 3 file, hapus 1 di tengah → hasilnya hanya dari 2 file tersisa

### Validasi hasil Excel Mandiri

Cek kolom-kolom ini dari sample PDF:
- Baris pertama: `08/01/2025 | Mandiri | MCM InhouseTrf DARI DWI PUJO HARIYONO | - | 2.150.000 | 4.641.112.172,09`
- Total transaksi: 60 rows (sesuai jumlah baris di PDF)
- Closing balance baris terakhir: `3.726.947.204,27`

---

## 14. Catatan Parsing Mandiri — Edge Cases

Berdasarkan analisis PDF sample, perhatikan:

1. **Tanggal multiline:** Tanggal kadang terpecah menjadi `08/01/2025 12:10:` di baris 1 dan `50` di baris 2. Tangani dengan regex yang toleran terhadap spasi/newline di detik.

2. **Remark multiline:** Keterangan transaksi sering tersebar 2-4 baris. Kumpulkan semua baris antara satu tanggal dan tanggal berikutnya sebagai remark.

3. **Transfer fee:** Baris "Transfer Fee" pendek (bukan baris transaksi baru) — deteksi sebagai bagian dari remark transaksi sebelumnya jika tidak diawali tanggal.

4. **Baris referensi panjang:** Nomor referensi seperti `20250114123596454899102` — bisa ada di baris terpisah setelah remark utama.

5. **Baris "Biaya Adm", "Bunga", "Pajak":** Transaksi sah di akhir bulan tanpa remark panjang.

6. **Angka negatif:** Mandiri tidak menggunakan tanda `-` pada angka debit/kredit — nilai 0.00 menandakan kolom yang kosong.

---

## 15. Pengembangan Lanjutan (setelah MVP)

- [ ] Tambah parser BRI (cek signature: "BANK RAKYAT INDONESIA", format kolom berbeda)
- [ ] Tambah parser BCA (format: "REKENING KORAN", kolom Mutasi +/-)
- [ ] Tambah parser BNI, SMBC, Kopra
- [ ] Filter transaksi di preview (per bank, per periode, debit/kredit saja)
- [ ] Export per-bank sebagai file terpisah (zip download)
- [ ] Dark mode
- [ ] PWA support (installable, offline)
