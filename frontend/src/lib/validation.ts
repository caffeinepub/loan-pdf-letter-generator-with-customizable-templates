import { FormData } from '../types/form';

export function validateForm(formData: FormData): string[] {
  const errors: string[] = [];

  if (!formData.name.trim()) {
    errors.push('Name is required');
  }

  if (!formData.mobile.trim()) {
    errors.push('Mobile number is required');
  } else if (!isValidMobileNumber(formData.mobile)) {
    errors.push('Mobile number must contain only digits and common separators (+, -, (, ), space)');
  }

  if (!formData.address.trim()) {
    errors.push('Address is required');
  }

  if (!formData.panNumber.trim()) {
    errors.push('PAN Number is required');
  } else if (!isValidPanNumber(formData.panNumber)) {
    errors.push('PAN Number must be in format: ABCDE1234F');
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

  return errors;
}

function isValidMobileNumber(mobile: string): boolean {
  // Allow digits, spaces, hyphens, parentheses, and plus sign
  const mobileRegex = /^[\d\s\-\(\)\+]+$/;
  return mobileRegex.test(mobile);
}

function isValidPanNumber(pan: string): boolean {
  // PAN format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
}
