import { Template } from '../../types/templates';
import { FormData } from '../../types/form';
import { renderDocumentToCanvas } from './renderDocumentToCanvas';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from './layout';

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(new ArrayBuffer(totalLength));
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

export async function generatePdf(template: Template, formData: FormData): Promise<Blob> {
  const canvas = await renderDocumentToCanvas(template, formData);

  // Convert canvas to JPEG bytes
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const base64 = dataUrl.split(',')[1];
  const binaryStr = atob(base64);
  const jpegBytes = new Uint8Array(new ArrayBuffer(binaryStr.length));
  for (let i = 0; i < binaryStr.length; i++) {
    jpegBytes[i] = binaryStr.charCodeAt(i);
  }

  const jpegLength = jpegBytes.length;

  // Width and height in PDF points (1 point = 1/72 inch, 96 DPI)
  // A4 at 96 DPI: 794x1123 px → in points: 794*(72/96) x 1123*(72/96)
  const pdfW = Math.round((A4_WIDTH_PX * 72) / 96);
  const pdfH = Math.round((A4_HEIGHT_PX * 72) / 96);

  const enc = new TextEncoder();

  // Build PDF objects
  const obj1 = enc.encode('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  const obj2 = enc.encode('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  const obj3 = enc.encode(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfW} ${pdfH}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`
  );

  const streamContent = enc.encode(
    `q\n${pdfW} 0 0 ${pdfH} 0 0 cm\n/Im1 Do\nQ\n`
  );
  const obj4Header = enc.encode(
    `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n`
  );
  const obj4Footer = enc.encode('\nendstream\nendobj\n');

  const obj5Header = enc.encode(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${A4_WIDTH_PX} /Height ${A4_HEIGHT_PX} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegLength} >>\nstream\n`
  );
  const obj5Footer = enc.encode('\nendstream\nendobj\n');

  // Calculate byte offsets for xref
  const header = enc.encode('%PDF-1.4\n');
  const off1 = header.length;
  const off2 = off1 + obj1.length;
  const off3 = off2 + obj2.length;
  const off4 = off3 + obj3.length;
  const off5 = off4 + obj4Header.length + streamContent.length + obj4Footer.length;

  const xref = enc.encode(
    `xref\n0 6\n0000000000 65535 f \n${String(off1).padStart(10, '0')} 00000 n \n${String(off2).padStart(10, '0')} 00000 n \n${String(off3).padStart(10, '0')} 00000 n \n${String(off4).padStart(10, '0')} 00000 n \n${String(off5).padStart(10, '0')} 00000 n \n`
  );

  const startxref = off5 + obj5Header.length + jpegLength + obj5Footer.length;
  const trailer = enc.encode(
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`
  );

  const pdfBytes = concatUint8Arrays([
    header,
    obj1,
    obj2,
    obj3,
    obj4Header,
    streamContent,
    obj4Footer,
    obj5Header,
    jpegBytes,
    obj5Footer,
    xref,
    trailer,
  ]);

  // Explicitly cast to ArrayBuffer to satisfy TypeScript's BlobPart constraint
  // (pdfBytes.buffer is ArrayBufferLike which includes SharedArrayBuffer, but
  //  concatUint8Arrays always allocates with `new ArrayBuffer(...)` so this is safe)
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
