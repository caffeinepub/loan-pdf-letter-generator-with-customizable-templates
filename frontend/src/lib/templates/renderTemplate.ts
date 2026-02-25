import { Template } from '../../types/templates';
import { FormData } from '../../types/form';

export function renderTemplate(template: Template, formData: FormData): { headline: string; body: string } {
  let renderedHeadline = template.headline || '';
  let renderedBody = template.body || '';

  // Replace standard placeholders
  const replacements: Record<string, string> = {
    '{{name}}': formData.name || '[Name]',
    '{{mobile}}': formData.mobile || '[Mobile]',
    '{{address}}': formData.address || '[Address]',
    '{{panNumber}}': formData.panNumber || '[PAN Number]',
    '{{loanAmount}}': formData.loanAmount || '[Loan Amount]',
    '{{interestRate}}': formData.interestRate || '[Interest Rate]',
    '{{year}}': formData.year || '[Year]',
    '{{monthlyEmi}}': formData.monthlyEmi || '[Monthly EMI]',
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
