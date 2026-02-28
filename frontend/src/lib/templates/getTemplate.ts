import { Template } from '../../types/templates';

export const BUILT_IN_DOC_TYPES = ['home', 'personal', 'vehicle', 'business', 'education'];

const DEFAULT_BUSINESS_NAME = 'Bajaj Finserv';
const DEFAULT_BUSINESS_ADDRESS = 'Bajaj Auto Limited Complex, Mumbai - Pune Road, Akurdi, Pune - 411035';

export const BUILT_IN_TEMPLATES: Template[] = [
  {
    id: 'home',
    name: 'Home Loan',
    documentType: 'home',
    headline: 'HOME LOAN SANCTION LETTER',
    body: `Dear {{name}},

We are pleased to inform you that your Home Loan application has been sanctioned with the following terms:

Loan Amount: ₹{{loanAmount}}
Rate of Interest: {{interestRate}}% per annum
Loan Tenure: {{tenureYears}} years
EMI Amount: ₹{{emi}}
Processing Charge: ₹{{processingCharge}}

Bank Account Details:
Account Number: {{accountNumber}}
IFSC Code: {{ifscCode}}
Bank Name: {{bankName}}

This sanction is subject to the terms and conditions of the loan agreement. Please sign and return the enclosed copy of this letter as your acceptance.

Yours sincerely,
Bajaj Finserv Home Finance Limited`,
    businessName: DEFAULT_BUSINESS_NAME,
    businessAddress: DEFAULT_BUSINESS_ADDRESS,
    watermarkText: 'BAJAJ FINSERV',
    watermarkOpacity: 0.08,
    showWatermark: true,
    footerText: 'Bajaj Finserv | CIN: U65910MH2007PLC174987 | www.bajajfinserv.in',
    footerLayout: 'centered',
    headerColor: '#003087',
    showQrCode: false,
    qrPayload: '',
    signatureLayout: 'sideBySide',
  },
  {
    id: 'personal',
    name: 'Personal Loan',
    documentType: 'personal',
    headline: 'PERSONAL LOAN SANCTION LETTER',
    body: `Dear {{name}},

We are delighted to inform you that your Personal Loan application has been approved with the following details:

Loan Amount: ₹{{loanAmount}}
Rate of Interest: {{interestRate}}% per annum
Loan Tenure: {{tenureYears}} years
EMI Amount: ₹{{emi}}
Processing Charge: ₹{{processingCharge}}

Disbursement Account:
Account Number: {{accountNumber}}
IFSC Code: {{ifscCode}}
Bank Name: {{bankName}}

The loan amount will be disbursed to your registered bank account within 24-48 hours of document verification. This offer is valid for 30 days from the date of this letter.

Yours sincerely,
Bajaj Finserv Lending Limited`,
    businessName: DEFAULT_BUSINESS_NAME,
    businessAddress: DEFAULT_BUSINESS_ADDRESS,
    watermarkText: 'BAJAJ FINSERV',
    watermarkOpacity: 0.08,
    showWatermark: true,
    footerText: 'Bajaj Finserv | CIN: U65910MH2007PLC174987 | www.bajajfinserv.in',
    footerLayout: 'centered',
    headerColor: '#003087',
    showQrCode: false,
    qrPayload: '',
    signatureLayout: 'sideBySide',
  },
  {
    id: 'vehicle',
    name: 'Vehicle Loan',
    documentType: 'vehicle',
    headline: 'VEHICLE LOAN SANCTION LETTER',
    body: `Dear {{name}},

We are pleased to sanction your Vehicle Loan application with the following terms and conditions:

Loan Amount: ₹{{loanAmount}}
Rate of Interest: {{interestRate}}% per annum
Loan Tenure: {{tenureYears}} years
EMI Amount: ₹{{emi}}
Processing Charge: ₹{{processingCharge}}

Repayment Account:
Account Number: {{accountNumber}}
IFSC Code: {{ifscCode}}
Bank Name: {{bankName}}

The loan is sanctioned for the purchase of the vehicle as mentioned in your application. The vehicle will be hypothecated to Bajaj Finserv until the loan is fully repaid.

Yours sincerely,
Bajaj Finserv Auto Finance Limited`,
    businessName: DEFAULT_BUSINESS_NAME,
    businessAddress: DEFAULT_BUSINESS_ADDRESS,
    watermarkText: 'BAJAJ FINSERV',
    watermarkOpacity: 0.08,
    showWatermark: true,
    footerText: 'Bajaj Finserv | CIN: U65910MH2007PLC174987 | www.bajajfinserv.in',
    footerLayout: 'centered',
    headerColor: '#003087',
    showQrCode: false,
    qrPayload: '',
    signatureLayout: 'sideBySide',
  },
  {
    id: 'business',
    name: 'Business Loan',
    documentType: 'business',
    headline: 'BUSINESS LOAN SANCTION LETTER',
    body: `Dear {{name}},

We are pleased to inform you that your Business Loan application has been sanctioned:

Loan Amount: ₹{{loanAmount}}
Rate of Interest: {{interestRate}}% per annum
Loan Tenure: {{tenureYears}} years
EMI Amount: ₹{{emi}}
Processing Charge: ₹{{processingCharge}}

Disbursement Account:
Account Number: {{accountNumber}}
IFSC Code: {{ifscCode}}
Bank Name: {{bankName}}

This loan is sanctioned for business purposes only. Misuse of funds may result in immediate recall of the loan. Please ensure timely repayment to maintain a healthy credit score.

Yours sincerely,
Bajaj Finserv Business Finance`,
    businessName: DEFAULT_BUSINESS_NAME,
    businessAddress: DEFAULT_BUSINESS_ADDRESS,
    watermarkText: 'BAJAJ FINSERV',
    watermarkOpacity: 0.08,
    showWatermark: true,
    footerText: 'Bajaj Finserv | CIN: U65910MH2007PLC174987 | www.bajajfinserv.in',
    footerLayout: 'centered',
    headerColor: '#003087',
    showQrCode: false,
    qrPayload: '',
    signatureLayout: 'sideBySide',
  },
  {
    id: 'education',
    name: 'Education Loan',
    documentType: 'education',
    headline: 'EDUCATION LOAN SANCTION LETTER',
    body: `Dear {{name}},

We are happy to inform you that your Education Loan application has been approved:

Loan Amount: ₹{{loanAmount}}
Rate of Interest: {{interestRate}}% per annum
Loan Tenure: {{tenureYears}} years
EMI Amount: ₹{{emi}}
Processing Charge: ₹{{processingCharge}}

Disbursement Account:
Account Number: {{accountNumber}}
IFSC Code: {{ifscCode}}
Bank Name: {{bankName}}

The loan will be disbursed directly to the educational institution as per the fee schedule. Repayment will commence 6 months after course completion or 12 months after the first disbursement, whichever is earlier.

Yours sincerely,
Bajaj Finserv Education Finance`,
    businessName: DEFAULT_BUSINESS_NAME,
    businessAddress: DEFAULT_BUSINESS_ADDRESS,
    watermarkText: 'BAJAJ FINSERV',
    watermarkOpacity: 0.08,
    showWatermark: true,
    footerText: 'Bajaj Finserv | CIN: U65910MH2007PLC174987 | www.bajajfinserv.in',
    footerLayout: 'centered',
    headerColor: '#003087',
    showQrCode: false,
    qrPayload: '',
    signatureLayout: 'sideBySide',
  },
];

export function getBuiltInTemplate(documentType: string): Template | undefined {
  return BUILT_IN_TEMPLATES.find((t) => t.documentType === documentType);
}

export function normalizeTemplate(template: Partial<Template>): Template {
  const base = getBuiltInTemplate(template.documentType || 'home') || BUILT_IN_TEMPLATES[0];
  return {
    ...base,
    ...template,
    id: template.id || base.id,
    name: template.name || base.name,
    documentType: template.documentType || base.documentType,
  };
}

const CUSTOM_TEMPLATES_KEY = 'loan_custom_templates';

export function getCustomTemplates(): Template[] {
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Template[];
  } catch {
    return [];
  }
}

export function saveCustomTemplates(templates: Template[]): void {
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
  } catch {
    // ignore
  }
}
