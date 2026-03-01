export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export type LoanType =
  | 'Home Loan'
  | 'Personal Loan'
  | 'Business Loan'
  | 'Vehicle Loan'
  | 'Education Loan'
  | '';

export interface FormData {
  name: string;
  loanType: LoanType;
  loanAmount: string;
  interestRate: string;
  year: string;
  monthlyEmi: string;
  processingCharge: string;
  bankAccountNumber: string;
  ifscCode: string;
  upiId: string;
  customFields: CustomField[];
}

export type DocumentType =
  | 'Loan Approval Letter'
  | 'Loan Section Letter'
  | 'TDS Deduction Intimation'
  | 'GST Letter';
