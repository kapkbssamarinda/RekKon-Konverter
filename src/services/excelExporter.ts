import * as XLSX from 'xlsx';
import type { BankStatement } from '../parsers/types';

export function exportToExcel(statements: BankStatement[]): void {
  const wb = XLSX.utils.book_new();

  // Sheet Gabungan
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
    }))
  );

  if (allRows.length > 0) {
    const wsGabungan = XLSX.utils.json_to_sheet(allRows);
    autoWidthCols(wsGabungan, Object.keys(allRows[0]));
    XLSX.utils.book_append_sheet(wb, wsGabungan, 'Gabungan');
  }

  // Sheet per bank
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
      }))
    );

    if (rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(rows);
      autoWidthCols(ws, Object.keys(rows[0]));
      XLSX.utils.book_append_sheet(wb, ws, bankName.slice(0, 31));
    }
  }

  // Sheet Ringkasan
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
  }));

  if (summaryRows.length > 0) {
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    autoWidthCols(wsSummary, Object.keys(summaryRows[0]));
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `RekKoran_Gabungan_${timestamp}.xlsx`);
}

function autoWidthCols(ws: XLSX.WorkSheet, headers: string[]) {
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 15) }));
}
