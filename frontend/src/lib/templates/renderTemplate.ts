import { Template } from '../../types/templates';
import { FormData } from '../../types/form';
import { formatCurrency } from '../loan/calculateEmi';

export function renderTemplate(
  template: Template,
  formData: FormData
): { headline: string; body: string } {
  let renderedHeadline = template.headline || '';
  let renderedBody = template.body || '';

  const processingChargeNum = parseFloat(formData.processingCharge) || 0;
  const monthlyEmiNum = parseFloat(formData.monthlyEmi) || 0;

  // Replace standard placeholders
  const replacements: Record<string, string> = {
    '{{name}}': formData.name || '[Name]',
    '{{loanType}}': formData.loanType || '[Loan Type]',
    '{{loanAmount}}': formData.loanAmount || '[Loan Amount]',
    '{{interestRate}}': formData.interestRate || '[Interest Rate]',
    '{{year}}': formData.year || '[Year]',
    '{{monthlyEmi}}': monthlyEmiNum > 0 ? formatCurrency(monthlyEmiNum) : '[Monthly EMI]',
    '{{processingCharge}}': processingChargeNum > 0 ? formatCurrency(processingChargeNum) : '[Processing Charge]',
    '{{bankAccountNumber}}': formData.bankAccountNumber || '[Bank Account Number]',
    '{{ifscCode}}': formData.ifscCode || '[IFSC Code]',
    '{{upiId}}': formData.upiId || '[UPI ID]',
    // Legacy placeholders — kept for backward compatibility
    '{{mobile}}': '[Mobile]',
    '{{address}}': '[Address]',
    '{{panNumber}}': '[PAN Number]',
  };

  // Add custom field placeholders
  formData.customFields.forEach((field) => {
    replacements[`{{custom:${field.label}}}`] = field.value || `[${field.label}]`;
  });

  // Apply replacements
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    renderedHeadline = renderedHeadline.replace(regex, value);
    renderedBody = renderedBody.replace(regex, value);
  });

  return {
    headline: renderedHeadline,
    body: renderedBody,
  };
}
