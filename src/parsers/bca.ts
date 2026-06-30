import type { BankParser } from './types';

export const bcaParser: BankParser = {
  bankName: 'BCA',
  detect: (text) => text.toLowerCase().includes('bank central asia') || text.includes('BCA'),
  parse: (_pages) => ({ success: false, error: 'Parser BCA belum diimplementasikan.' }),
};
