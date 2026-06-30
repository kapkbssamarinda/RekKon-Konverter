import type { BankParser } from './types';

export const kopraParser: BankParser = {
  bankName: 'Kopra',
  detect: (text) => text.toLowerCase().includes('kopra') && !text.toLowerCase().includes('mandiri'),
  parse: (_pages) => ({ success: false, error: 'Parser Kopra belum diimplementasikan.' }),
};
