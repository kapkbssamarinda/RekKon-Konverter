import { mandiriParser } from './mandiri';
import { briParser } from './bri';
import { bcaParser } from './bca';
import { bniParser } from './bni';
import { smbcParser } from './smbc';
import { kopraParser } from './kopra';
import type { BankParser, ParseResult } from './types';

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
