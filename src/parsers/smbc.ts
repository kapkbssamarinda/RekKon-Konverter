import type { BankParser } from './types';

export const smbcParser: BankParser = {
  bankName: 'SMBC',
  detect: (text) => text.toLowerCase().includes('sumitomo mitsui') || text.toLowerCase().includes('smbc'),
  parse: (_pages) => ({ success: false, error: 'Parser SMBC belum diimplementasikan.' }),
};
