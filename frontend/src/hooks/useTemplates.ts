import { useState } from 'react';
import { DocumentType, Template, CustomTemplate } from '../types/templates';
import { getCustomTemplates, saveCustomTemplates } from '../lib/templates/getTemplate';

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

export function useTemplates() {
  const [builtInTemplates, setBuiltInTemplates] = useState<Record<DocumentType, Template>>(
    () => ({ ...DEFAULT_TEMPLATES })
  );
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(
    () => getCustomTemplates()
  );

  const updateBuiltInTemplate = (docType: DocumentType, updates: Partial<Template>) => {
    setBuiltInTemplates((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], ...updates },
    }));
  };

  const createCustomTemplate = (name: string) => {
    const base = DEFAULT_TEMPLATES['Loan Approval Letter'];
    const newTemplate: CustomTemplate = {
      ...base,
      id: `custom-${Date.now()}`,
      name,
      headline: name,
    };
    setCustomTemplates((prev) => {
      const updated = [...prev, newTemplate];
      saveCustomTemplates(updated);
      return updated;
    });
  };

  const updateCustomTemplate = (id: string, updates: Partial<CustomTemplate>) => {
    setCustomTemplates((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      saveCustomTemplates(updated);
      return updated;
    });
  };

  const deleteCustomTemplate = (id: string) => {
    setCustomTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveCustomTemplates(updated);
      return updated;
    });
  };

  return {
    builtInTemplates,
    customTemplates,
    updateBuiltInTemplate,
    createCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
  };
}
