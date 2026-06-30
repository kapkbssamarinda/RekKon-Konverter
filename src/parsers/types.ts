export interface Transaction {
  postingDate: string;
  remark: string;
  referenceNo: string;
  debit: number | null;
  credit: number | null;
  balance: number;
}

export interface BankStatement {
  bankName: string;
  accountNo: string;
  accountName: string;
  currency: string;
  branch: string;
  periodStart: string;
  periodEnd: string;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  transactions: Transaction[];
  sourceFile: string;
}

export interface ParseResult {
  success: boolean;
  data?: BankStatement;
  error?: string;
}

export interface BankParser {
  bankName: string;
  detect: (rawText: string) => boolean;
  parse: (pages: string[]) => ParseResult;
}
