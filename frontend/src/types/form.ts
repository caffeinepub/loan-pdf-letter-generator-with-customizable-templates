export interface CustomField {
  key: string;
  value: string;
}

export interface FormData {
  // Applicant details
  name: string;
  email: string;
  phone: string;
  address: string;

  // Loan parameters
  loanAmount: string;
  interestRate: string;
  tenureYears: string;
  processingCharge: string;

  // Bank account fields
  accountNumber: string;
  ifscCode: string;
  bankName: string;

  // Custom fields
  customFields: CustomField[];

  // Document type
  documentType: string;
}

export type LoanType = 'home' | 'personal' | 'business' | 'vehicle' | 'education';

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  home: 'Home Loan',
  personal: 'Personal Loan',
  business: 'Business Loan',
  vehicle: 'Vehicle Loan',
  education: 'Education Loan',
};

export const DEFAULT_FORM_DATA: FormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  loanAmount: '',
  interestRate: '',
  tenureYears: '',
  processingCharge: '',
  accountNumber: '',
  ifscCode: '',
  bankName: '',
  customFields: [],
  documentType: 'home',
};
