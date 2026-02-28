import { FormData } from '../types/form';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateForm(formData: FormData): ValidationResult {
  const errors: string[] = [];

  // Name validation
  if (!formData.name || formData.name.trim() === '') {
    errors.push('Applicant name is required');
  }

  // Loan amount validation
  if (!formData.loanAmount || formData.loanAmount.trim() === '') {
    errors.push('Loan amount is required');
  } else {
    const amount = parseFloat(formData.loanAmount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Loan amount must be a positive number');
    }
  }

  // Interest rate validation
  if (!formData.interestRate || formData.interestRate.trim() === '') {
    errors.push('Interest rate is required');
  } else {
    const rate = parseFloat(formData.interestRate);
    if (isNaN(rate) || rate <= 0) {
      errors.push('Interest rate must be a positive number');
    }
  }

  // Tenure validation
  if (!formData.tenureYears || formData.tenureYears.trim() === '') {
    errors.push('Loan tenure is required');
  } else {
    const tenure = parseInt(formData.tenureYears, 10);
    if (isNaN(tenure) || tenure <= 0 || !Number.isInteger(tenure)) {
      errors.push('Loan tenure must be a positive whole number');
    }
  }

  // Processing charge validation (optional but must be non-negative if provided)
  if (formData.processingCharge && formData.processingCharge.trim() !== '') {
    const charge = parseFloat(formData.processingCharge);
    if (isNaN(charge) || charge < 0) {
      errors.push('Processing charge must be a non-negative number');
    }
  }

  // Custom fields validation
  for (const field of formData.customFields) {
    if (field.key.trim() === '' && field.value.trim() !== '') {
      errors.push('Custom field key cannot be empty when value is provided');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
