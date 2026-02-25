import { DocumentType, Template, CustomTemplate } from '../../types/templates';

const DEFAULT_TEMPLATES: Record<DocumentType, Template> = {
  'Loan Approval Letter': {
    headline: 'Loan Approval Letter',
    body: `Dear {{name}},

We are pleased to inform you that your loan application has been approved.

Applicant Details:
Name: {{name}}
Mobile: {{mobile}}
Address: {{address}}
PAN Number: {{panNumber}}

Loan Details:
Loan Amount: ₹{{loanAmount}}
Interest Rate: {{interestRate}}% per annum
Tenure: {{year}} years
Monthly EMI: ₹{{monthlyEmi}}

Please contact us to complete the documentation process.

Best regards,
Loan Department`,
    logoDataUrl: null,
    headerColor: '',
    businessName: '',
    businessAddress: '',
    watermarkText: 'APPROVED',
    footerText: 'This is a computer-generated document and does not require a signature.',
    background: { dataUrl: null, opacity: 0.1, fit: 'cover' },
    watermark: { text: 'APPROVED', opacity: 0.05, size: 72, rotation: -45, position: 'center' },
    seal: { dataUrl: null, size: 100, position: 'bottom-left' },
    signature: { dataUrl: null, size: 120, position: 'bottom-right' },
  },
  'Loan GST Letter': {
    headline: 'Loan GST Letter',
    body: `Dear {{name}},

This letter confirms the GST details for your approved loan.

Applicant Details:
Name: {{name}}
Mobile: {{mobile}}
Address: {{address}}
PAN Number: {{panNumber}}

Loan Details:
Loan Amount: ₹{{loanAmount}}
Interest Rate: {{interestRate}}% per annum
Tenure: {{year}} years
Monthly EMI: ₹{{monthlyEmi}}

GST will be applicable as per current regulations.

Sincerely,
Finance Department`,
    logoDataUrl: null,
    headerColor: '',
    businessName: '',
    businessAddress: '',
    watermarkText: 'GST APPLICABLE',
    footerText: 'For GST queries, please contact our tax department.',
    background: { dataUrl: null, opacity: 0.1, fit: 'cover' },
    watermark: { text: 'GST APPLICABLE', opacity: 0.05, size: 72, rotation: -45, position: 'center' },
    seal: { dataUrl: null, size: 100, position: 'bottom-left' },
    signature: { dataUrl: null, size: 120, position: 'bottom-right' },
  },
  'Loan Section Letter': {
    headline: 'Loan Section Letter',
    body: `Dear {{name}},

This letter provides the section details for your loan account.

Applicant Details:
Name: {{name}}
Mobile: {{mobile}}
Address: {{address}}
PAN Number: {{panNumber}}

Loan Details:
Loan Amount: ₹{{loanAmount}}
Interest Rate: {{interestRate}}% per annum
Tenure: {{year}} years
Monthly EMI: ₹{{monthlyEmi}}

Your loan has been processed under the applicable section.

Best regards,
Loan Administration`,
    logoDataUrl: null,
    headerColor: '',
    businessName: '',
    businessAddress: '',
    watermarkText: 'CONFIDENTIAL',
    footerText: 'This document is confidential and intended only for the addressee.',
    background: { dataUrl: null, opacity: 0.1, fit: 'cover' },
    watermark: { text: 'CONFIDENTIAL', opacity: 0.05, size: 72, rotation: -45, position: 'center' },
    seal: { dataUrl: null, size: 100, position: 'bottom-left' },
    signature: { dataUrl: null, size: 120, position: 'bottom-right' },
  },
};

function normalizeTemplate(template: any): Template {
  return {
    ...template,
    businessName: template.businessName ?? '',
    businessAddress: template.businessAddress ?? '',
    headerColor: template.headerColor ?? '',
    background: template.background || { dataUrl: null, opacity: 0.1, fit: 'cover' },
    watermark: template.watermark || {
      text: template.watermarkText || '',
      opacity: 0.05,
      size: 72,
      rotation: -45,
      position: 'center',
    },
    seal: template.seal || { dataUrl: null, size: 100, position: 'bottom-left' },
    signature: template.signature || { dataUrl: null, size: 120, position: 'bottom-right' },
  };
}

export function getTemplate(docType: DocumentType | string): Template {
  const stored = localStorage.getItem('document-templates');
  if (stored) {
    try {
      const templates = JSON.parse(stored);
      if (templates[docType]) {
        return normalizeTemplate(templates[docType]);
      }
    } catch (error) {
      console.error('Error loading template from storage:', error);
    }
  }

  const customTemplates = getCustomTemplates();
  const customTemplate = customTemplates.find((t) => t.id === docType);
  if (customTemplate) {
    return normalizeTemplate(customTemplate);
  }

  return normalizeTemplate(DEFAULT_TEMPLATES[docType as DocumentType] || DEFAULT_TEMPLATES['Loan Approval Letter']);
}

export function getCustomTemplates(): CustomTemplate[] {
  try {
    const stored = localStorage.getItem('custom-templates');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((t: any) => normalizeTemplate(t));
    }
    return [];
  } catch (error) {
    console.error('Error loading custom templates:', error);
    return [];
  }
}

export function saveCustomTemplates(templates: CustomTemplate[]): void {
  try {
    localStorage.setItem('custom-templates', JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving custom templates:', error);
  }
}
