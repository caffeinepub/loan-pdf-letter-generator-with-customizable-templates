export async function sharePdf(blob: Blob, filename: string): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    const file = new File([blob], filename, { type: 'application/pdf' });
    await navigator.share({
      title: 'Loan Document',
      text: 'Please find the loan document attached.',
      files: [file],
    });
    return true;
  } catch (err) {
    // User cancelled or sharing failed
    return false;
  }
}
