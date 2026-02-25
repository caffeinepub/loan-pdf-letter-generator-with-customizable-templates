export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface FormData {
  name: string;
  mobile: string;
  address: string;
  panNumber: string;
  loanAmount: string;
  interestRate: string;
  year: string;
  monthlyEmi: string;
  customFields: CustomField[];
}

export type DocumentType = 'Loan Approval Letter' | 'Loan GST Letter' | 'Loan Section Letter';
