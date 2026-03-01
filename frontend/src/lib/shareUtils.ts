/**
 * Utility for sharing PDF files using the Web Share API with fallback to download.
 */

/**
 * Attempts to share a PDF blob using the Web Share API.
 * Returns true if sharing was initiated, false if fallback to download is needed.
 */
export async function sharePdf(blob: Blob, filename: string): Promise<boolean> {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function'
  ) {
    const file = new File([blob], filename, { type: 'application/pdf' });
    const shareData: ShareData = {
      title: 'Loan Document',
      files: [file],
    };

    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (err: unknown) {
        // User cancelled or share failed
        if (err instanceof Error && err.name === 'AbortError') {
          // User cancelled — not an error
          return true;
        }
        return false;
      }
    }
  }
  return false;
}
