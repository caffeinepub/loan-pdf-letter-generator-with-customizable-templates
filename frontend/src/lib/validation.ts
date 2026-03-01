import { FormData } from '../types/form';

export function validateForm(formData: FormData): string[] {
  const errors: string[] = [];

  if (!formData.name.trim()) {
    errors.push('Name is required');
  }

  if (!formData.loanAmount.trim()) {
    errors.push('Loan Amount is required');
  } else if (isNaN(Number(formData.loanAmount)) || Number(formData.loanAmount) <= 0) {
    errors.push('Loan Amount must be a positive number');
  }

  if (!formData.interestRate.trim()) {
    errors.push('Interest Rate is required');
  } else if (isNaN(Number(formData.interestRate)) || Number(formData.interestRate) < 0) {
    errors.push('Interest Rate must be a non-negative number');
  }

  if (!formData.year.trim()) {
    errors.push('Year is required');
  }

  if (
    formData.processingCharge.trim() !== '' &&
    (isNaN(Number(formData.processingCharge)) || Number(formData.processingCharge) < 0)
  ) {
    errors.push('Processing Charge must be a non-negative number');
  }

  return errors;
}
