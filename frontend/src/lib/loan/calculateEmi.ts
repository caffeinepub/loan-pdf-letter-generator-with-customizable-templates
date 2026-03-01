/**
 * Calculate Monthly EMI (Equated Monthly Installment)
 * Formula: EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
 * where:
 * P = Principal loan amount
 * R = Monthly interest rate (annual rate / 12 / 100)
 * N = Number of monthly installments (years * 12)
 */
export function calculateEmi(
  loanAmount: number,
  annualInterestRate: number,
  years: number
): number {
  if (loanAmount <= 0 || annualInterestRate < 0 || years <= 0) {
    return 0;
  }

  const principal = loanAmount;
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfMonths = years * 12;

  // Handle zero interest rate case
  if (monthlyRate === 0) {
    return principal / numberOfMonths;
  }

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
    (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

  return Math.round(emi * 100) / 100; // Round to 2 decimal places
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
