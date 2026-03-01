import type { DocumentType } from '../../types/form';
import { Template, CustomTemplate } from '../../types/templates';

const BUILT_IN_DOC_TYPES: DocumentType[] = [
  'Loan Approval Letter',
  'Loan Section Letter',
  'TDS Deduction Intimation',
  'GST Letter',
];

const APPROVAL_LETTER_BODY = `Application Number: BP874562193045
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
Loan Department`;

const LOAN_SECTION_LETTER_BODY = `Reference Number: LAG562198743026
Subject: Loan Section Reference Letter

Dear {{name}},

This letter is issued under the relevant loan section for your reference and records.

Applicant Details

Name: {{name}}
Loan Type: {{loanType}}
Loan Amount: ₹{{loanAmount}}
Interest Rate: {{interestRate}}% per annum
Tenure: {{year}} years
Monthly EMI: ₹{{monthlyEmi}}
Processing Charge: ₹{{processingCharge}}

Bank Account Details

Bank Account Number: {{bankAccountNumber}}
IFSC Code: {{ifscCode}}
UPI ID: {{upiId}}

Important Information

• This letter is issued for reference purposes only.
• Please retain this letter for your records throughout the loan tenure.
• For any queries regarding your loan account, contact our customer care.
• All terms and conditions of the loan agreement remain applicable.
• This document is computer-generated and does not require a physical signature.

For any assistance, please contact our support team or visit your nearest Bajaj Finance branch.

Best regards,
Loan Department
Bajaj Finance Limited`;

const TDS_DEDUCTION_INTIMATION_BODY = `Application Number: APLOAN74962926
Loan Number: PLOAN6926946926
Subject: TDS Deduction Intimation

Dear {{name}},

Greetings from the Loan Department. This is to formally inform you that, in accordance with applicable taxation guidelines, TDS-related formalities have been initiated in connection with your {{loanType}} loan under Application Number APLOAN74962926 and Loan Number PLOAN6926946926.

As per our records, the sanctioned loan amount for your application is ₹{{loanAmount}}. All statutory deductions and reporting requirements are being processed in line with prevailing financial and tax regulations. You are advised to retain this letter for your records and future reference.

Please note that any processing charge of ₹{{processingCharge}} paid towards documentation, verification, or file handling will be accounted for as per the company's financial policies and applicable tax provisions. Where eligible, the same will be adjusted or refunded in accordance with the approved terms and compliance requirements.

Our team is committed to maintaining full transparency throughout the loan lifecycle. Should you require any clarification regarding TDS treatment or related documentation, please feel free to contact our support team.

Warm regards,
Loan Department`;

const GST_LETTER_BODY = `Application Number: APLOAN74962926
Loan Number: PLOAN6926946926
Subject: GST Compliance Confirmation

Dear {{name}},

Greetings from the Loan Department. We would like to inform you that GST-related compliance activities concerning your {{loanType}} loan application (Application No. APLOAN74962926, Loan No. PLOAN6926946926) are currently under process as per applicable regulatory guidelines.

Based on the documents submitted by you, the sanctioned loan amount stands at ₹{{loanAmount}}. All applicable statutory charges and compliance requirements are being handled in accordance with prevailing GST norms and internal financial policies. This communication is issued for your official record and reference.

Kindly note that any GST charge of ₹{{processingCharge}} collected towards documentation, verification, or administrative formalities is governed strictly by company policy and applicable tax regulations. Wherever eligible, adjustments or refunds will be processed subject to successful verification and completion of required formalities.

We remain committed to ensuring a transparent and smooth experience for you. In case any additional documentation is required, our representative may contact you.

Warm regards,
Loan Department`;

const DEFAULT_TEMPLATES: Record<DocumentType, Template> = {
  'Loan Approval Letter': {
    id: 'Loan Approval Letter',
    name: 'Loan Approval Letter',
    headline: 'Loan Approval Letter',
    body: APPROVAL_LETTER_BODY,
    logoDataUrl: null,
    headerColor: '#1a365d',
    businessName: '',
    businessAddress: '',
    watermarkText: 'APPROVED',
    footerText: 'This is a computer-generated document and does not require a signature.',
    logoSize: 'medium',
    background: { enabled: false, dataUrl: null, opacity: 0.1, fit: 'cover' },
    watermark: {
      enabled: true,
      text: 'BAJAJ FINANCE',
      opacity: 0.08,
      size: 72,
      rotation: -45,
      position: 'center',
      color: '#cccccc',
      watermarkImageUrl: '/assets/generated/etds-watermark.dim_600x300.png',
    },
    seal: { enabled: false, dataUrl: null, size: 100, position: 'bottom-left', opacity: 80 },
    signature: { enabled: false, dataUrl: null, size: 120, position: 'bottom-right', opacity: 100, signatoryName: '', signatoryTitle: '' },
  },
  'Loan Section Letter': {
    id: 'Loan Section Letter',
    name: 'Loan Section Letter',
    headline: 'Loan Section Letter',
    body: LOAN_SECTION_LETTER_BODY,
    logoDataUrl: null,
    headerColor: '#1a365d',
    businessName: '',
    businessAddress: '',
    watermarkText: 'SECTION LETTER',
    footerText: 'This is a computer-generated document and does not require a signature.',
    logoSize: 'medium',
    background: { enabled: false, dataUrl: null, opacity: 0.1, fit: 'cover' },
    watermark: {
      enabled: true,
      text: 'BAJAJ FINANCE',
      opacity: 0.08,
      size: 72,
      rotation: -45,
      position: 'center',
      color: '#cccccc',
      watermarkImageUrl: '/assets/generated/etds-watermark.dim_600x300.png',
    },
    seal: { enabled: false, dataUrl: null, size: 100, position: 'bottom-left', opacity: 80 },
    signature: { enabled: false, dataUrl: null, size: 120, position: 'bottom-right', opacity: 100, signatoryName: '', signatoryTitle: '' },
  },
  'TDS Deduction Intimation': {
    id: 'TDS Deduction Intimation',
    name: 'TDS Deduction Intimation',
    headline: 'TDS Deduction Intimation',
    body: TDS_DEDUCTION_INTIMATION_BODY,
    logoDataUrl: null,
    headerColor: '#1a365d',
    businessName: '',
    businessAddress: '',
    watermarkText: 'TDS INTIMATION',
    footerText: 'This is a computer-generated document and does not require a signature.',
    logoSize: 'medium',
    background: { enabled: false, dataUrl: null, opacity: 0.1, fit: 'cover' },
    watermark: {
      enabled: true,
      text: 'BAJAJ FINANCE',
      opacity: 0.08,
      size: 72,
      rotation: -45,
      position: 'center',
      color: '#cccccc',
      watermarkImageUrl: '/assets/generated/etds-watermark.dim_600x300.png',
    },
    seal: { enabled: false, dataUrl: null, size: 100, position: 'bottom-left', opacity: 80 },
    signature: { enabled: false, dataUrl: null, size: 120, position: 'bottom-right', opacity: 100, signatoryName: '', signatoryTitle: '' },
  },
  'GST Letter': {
    id: 'GST Letter',
    name: 'GST Letter',
    headline: 'GST Letter',
    body: GST_LETTER_BODY,
    logoDataUrl: null,
    headerColor: '#1a365d',
    businessName: '',
    businessAddress: '',
    watermarkText: 'GST COMPLIANCE',
    footerText: 'This is a computer-generated document and does not require a signature.',
    logoSize: 'medium',
    background: { enabled: false, dataUrl: null, opacity: 0.1, fit: 'cover' },
    watermark: {
      enabled: true,
      text: 'GST',
      opacity: 0.18,
      size: 72,
      rotation: -45,
      position: 'center',
      color: '#cccccc',
      watermarkImageUrl: '/assets/generated/gst-watermark.dim_400x400.png',
    },
    seal: { enabled: false, dataUrl: null, size: 100, position: 'bottom-left', opacity: 80 },
    signature: { enabled: false, dataUrl: null, size: 120, position: 'bottom-right', opacity: 100, signatoryName: '', signatoryTitle: '' },
  },
};

const STORAGE_KEY_PREFIX = 'loan_template_';
const CUSTOM_TEMPLATES_KEY = 'loan_custom_templates';

export function getTemplate(docType: DocumentType | string): Template {
  const key = docType as DocumentType;
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${docType}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<Template>;
      const base = DEFAULT_TEMPLATES[key] ?? DEFAULT_TEMPLATES['Loan Approval Letter'];
      return normalizeTemplate({ ...base, ...parsed });
    } catch {
      // fall through to default
    }
  }
  const base = DEFAULT_TEMPLATES[key] ?? DEFAULT_TEMPLATES['Loan Approval Letter'];
  return normalizeTemplate({ ...base });
}

export function getDefaultSanctionLetterTemplate(): Template {
  return normalizeTemplate({ ...DEFAULT_TEMPLATES['Loan Approval Letter'] });
}

export function getDefaultDisbursementTemplate(): Template {
  return normalizeTemplate({ ...DEFAULT_TEMPLATES['Loan Section Letter'] });
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
