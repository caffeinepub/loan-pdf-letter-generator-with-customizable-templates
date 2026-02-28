import { Template } from '../../types/templates';
import { FormData } from '../../types/form';
import { calculateEmi, formatCurrency } from '../loan/calculateEmi';

export function renderTemplate(
  template: Template,
  formData: FormData
): { headline: string; body: string } {
  const principal = parseFloat(formData.loanAmount) || 0;
  const rate = parseFloat(formData.interestRate) || 0;
  const tenure = parseInt(formData.tenureYears, 10) || 0;
  const emi = calculateEmi(principal, rate, tenure);
  const processingCharge = parseFloat(formData.processingCharge) || 0;

  const replacements: Record<string, string> = {
    '{{name}}': formData.name || '',
    '{{loanAmount}}': principal > 0 ? principal.toLocaleString('en-IN') : '',
    '{{interestRate}}': formData.interestRate || '',
    '{{tenureYears}}': formData.tenureYears || '',
    '{{emi}}': emi > 0 ? emi.toLocaleString('en-IN') : '',
    '{{processingCharge}}': processingCharge > 0 ? processingCharge.toLocaleString('en-IN') : '0',
    '{{accountNumber}}': formData.accountNumber || '',
    '{{ifscCode}}': formData.ifscCode || '',
    '{{bankName}}': formData.bankName || '',
    '{{email}}': formData.email || '',
    '{{phone}}': formData.phone || '',
    '{{address}}': formData.address || '',
  };

  // Add custom field replacements
  for (const field of formData.customFields) {
    if (field.key.trim()) {
      replacements[`{{${field.key}}}`] = field.value || '';
    }
  }

  let headline = template.headline;
  let body = template.body;

  for (const [placeholder, value] of Object.entries(replacements)) {
    headline = headline.split(placeholder).join(value);
    body = body.split(placeholder).join(value);
  }

  return { headline, body };
}
