import type { DocumentType } from '../../types/form';
import { Template, CustomTemplate } from '../../types/templates';

const BUILT_IN_DOC_TYPES: DocumentType[] = [
  'Loan Approval Letter',
  'Loan GST Letter',
  'Loan Section Letter',
];

const DEFAULT_TEMPLATES: Record<DocumentType, Template> = {
  'Loan Approval Letter': {
    id: 'Loan Approval Letter',
    name: 'Loan Approval Letter',
    headline: 'Loan Approval Letter',
    body: `Application Number: BP874562193045
Loan Number: LAG562198743026
Subject: Loan Application Approved – Next Steps

Dear {{name}},

Greetings from our Loan Department.

We are pleased to inform you that, based on the information and documents submitted by you, your {{loanType}} loan application has been successfully approved. After careful assessment of your profile, you have been sanctioned a loan amount of ₹{{loanAmount}} at an interest rate of {{interestRate}}% per annum for a tenure of {{year}} years.

As per the approved terms, your estimated monthly EMI will be ₹{{monthlyEmi}}, which will commence after the successful completion of the disbursement process and agreement formalities.

Processing & Verification

To initiate the final stage of loan disbursement, a processing charge of ₹{{processingCharge}} is applicable. This amount is required to complete documentation, verification, and file processing formalities.

:The processing charge is fully refundable as per company policy after successful completion of verification and loan disbursement formalities, subject to compliance with all required terms and conditions.

We assure you that our team will guide you at every step to ensure a smooth and transparent process.

Bank Account Details

Kindly use the following details for processing charge payment (if applicable):

Bank Account Number: {{bankAccountNumber}}
IFSC Code: {{ifscCode}}
UPI ID: {{upiId}}

After making the payment, please share the transaction details with our support team for quick verification and further processing.

• Please ensure all submitted documents are valid and accurate.
• Loan disbursement is subject to final verification and internal approval policies.
• Any discrepancy in documents may lead to delay or cancellation of the application.
• Our representative may contact you for additional information if required.

We request you to kindly connect with our team at the earliest to complete the remaining documentation and verification formalities so that your loan amount can be processed without delay.

If you have any questions or require assistance, please feel free to contact our support team. We are always happy to assist you.

Warm regards,
Loan Department`,
    logoDataUrl: null,
    headerColor: '#1a365d',
    businessName: '',
    businessAddress: '',
    watermarkText: 'APPROVED',
    footerText: 'This is a computer-generated document and does not require a signature.',
    logoSize: 'medium',
    background: { enabled: false, dataUrl: null, opacity: 0.1, fit: 'cover' },
    watermark: { enabled: false, text: 'APPROVED', opacity: 0.05, size: 72, rotation: -45, position: 'center', color: '#cccccc' },
    seal: { enabled: false, dataUrl: null, size: 100, position: 'bottom-left', opacity: 80 },
    signature: { enabled: false, dataUrl: null, size: 120, position: 'bottom-right', opacity: 100, signatoryName: '', signatoryTitle: '' },
  },
  'Loan GST Letter': {
    id: 'Loan GST Letter',
    name: 'Loan GST Letter',
    headline: 'Loan GST Letter',
    body: `Dear {{name}},

This letter confirms the GST details for your approved loan.

Applicant Details:
Name: {{name}}

Loan Details:
Loan Type: {{loanType}}
Loan Amount: ₹{{loanAmount}}
Interest Rate: {{interestRate}}% per annum
Tenure: {{year}} years
Monthly EMI: {{monthlyEmi}}
Processing Charge: {{processingCharge}}

Bank Account Details:
Bank Account Number: {{bankAccountNumber}}
IFSC Code: {{ifscCode}}
UPI ID: {{upiId}}

GST will be applicable as per government regulations.

Best regards,
Loan Department`,
    logoDataUrl: null,
    headerColor: '#1a365d',
    businessName: '',
    businessAddress: '',
    watermarkText: 'GST DOCUMENT',
    footerText: 'This is a computer-generated document and does not require a signature.',
    logoSize: 'medium',
    background: { enabled: false, dataUrl: null, opacity: 0.1, fit: 'cover' },
    watermark: { enabled: false, text: 'GST DOCUMENT', opacity: 0.05, size: 72, rotation: -45, position: 'center', color: '#cccccc' },
    seal: { enabled: false, dataUrl: null, size: 100, position: 'bottom-left', opacity: 80 },
    signature: { enabled: false, dataUrl: null, size: 120, position: 'bottom-right', opacity: 100, signatoryName: '', signatoryTitle: '' },
  },
  'Loan Section Letter': {
    id: 'Loan Section Letter',
    name: 'Loan Section Letter',
    headline: 'Loan Section Letter',
    body: `Dear {{name}},

This letter is issued under the relevant loan section for your reference.

Applicant Details:
Name: {{name}}

Loan Details:
Loan Type: {{loanType}}
Loan Amount: ₹{{loanAmount}}
Interest Rate: {{interestRate}}% per annum
Tenure: {{year}} years
Monthly EMI: {{monthlyEmi}}
Processing Charge: {{processingCharge}}

Bank Account Details:
Bank Account Number: {{bankAccountNumber}}
IFSC Code: {{ifscCode}}
UPI ID: {{upiId}}

Please retain this letter for your records.

Best regards,
Loan Department`,
    logoDataUrl: null,
    headerColor: '#1a365d',
    businessName: '',
    businessAddress: '',
    watermarkText: 'SECTION LETTER',
    footerText: 'This is a computer-generated document and does not require a signature.',
    logoSize: 'medium',
    background: { enabled: false, dataUrl: null, opacity: 0.1, fit: 'cover' },
    watermark: { enabled: false, text: 'SECTION LETTER', opacity: 0.05, size: 72, rotation: -45, position: 'center', color: '#cccccc' },
    seal: { enabled: false, dataUrl: null, size: 100, position: 'bottom-left', opacity: 80 },
    signature: { enabled: false, dataUrl: null, size: 120, position: 'bottom-right', opacity: 100, signatoryName: '', signatoryTitle: '' },
  },
};

const STORAGE_KEY_PREFIX = 'loan_template_';
const CUSTOM_TEMPLATES_KEY = 'loan_custom_templates';

export function getTemplate(docType: DocumentType): Template {
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${docType}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Template;
      return normalizeTemplate({ ...DEFAULT_TEMPLATES[docType], ...parsed });
    } catch {
      // fall through to default
    }
  }
  return normalizeTemplate({ ...DEFAULT_TEMPLATES[docType] });
}

export function getDefaultSanctionLetterTemplate(): Template {
  return normalizeTemplate({ ...DEFAULT_TEMPLATES['Loan Approval Letter'] });
}

export function getDefaultDisbursementTemplate(): Template {
  return normalizeTemplate({ ...DEFAULT_TEMPLATES['Loan GST Letter'] });
}

export function getDefaultNocTemplate(): Template {
  return normalizeTemplate({ ...DEFAULT_TEMPLATES['Loan Section Letter'] });
}

export function saveTemplate(docType: DocumentType, template: Template): void {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${docType}`, JSON.stringify(template));
}

export function getCustomTemplates(): CustomTemplate[] {
  const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as CustomTemplate[];
      return parsed.map((t) => normalizeTemplate(t) as CustomTemplate);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveCustomTemplates(templates: CustomTemplate[]): void {
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
}

export function normalizeTemplate<T extends Partial<Template>>(template: T): T & Template {
  const background = {
    enabled: false,
    dataUrl: null,
    opacity: 0.1,
    fit: 'cover' as const,
    ...(template.background ?? {}),
  };

  const watermark = {
    enabled: false,
    text: '',
    opacity: 0.05,
    size: 72,
    rotation: -45,
    position: 'center' as const,
    color: '#cccccc',
    ...(template.watermark ?? {}),
  };

  const seal = {
    enabled: false,
    dataUrl: null,
    size: 100,
    position: 'bottom-left' as const,
    opacity: 80,
    ...(template.seal ?? {}),
  };

  const signature = {
    enabled: false,
    dataUrl: null,
    size: 120,
    position: 'bottom-right' as const,
    opacity: 100,
    signatoryName: '',
    signatoryTitle: '',
    ...(template.signature ?? {}),
  };

  return {
    ...template,
    id: template.id ?? '',
    name: template.name ?? '',
    headline: template.headline ?? '',
    body: template.body ?? '',
    logoDataUrl: template.logoDataUrl ?? null,
    headerColor: template.headerColor ?? '#1a365d',
    businessName: template.businessName ?? '',
    businessAddress: template.businessAddress ?? '',
    watermarkText: template.watermarkText ?? '',
    footerText: template.footerText ?? '',
    logoSize: template.logoSize ?? 'medium',
    background,
    watermark,
    seal,
    signature,
  } as T & Template;
}

export { BUILT_IN_DOC_TYPES };
