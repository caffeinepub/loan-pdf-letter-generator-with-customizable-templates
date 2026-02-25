export function downloadFile(blob: Blob, filename: string): void {
  // For PNG images from our canvas-based PDF generation, we'll use .png extension
  // but keep the original filename structure
  const actualFilename = filename.replace('.pdf', '.png');
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = actualFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
