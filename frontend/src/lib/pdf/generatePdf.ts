import type { DocumentType } from '../../types/form';
import type { Template } from '../../types/templates';
import { getTemplate } from '../templates/getTemplate';
import { renderDocumentToCanvas } from './renderDocumentToCanvas';
import { PAGE_WIDTH, PAGE_HEIGHT } from './layout';

const BUILT_IN_DOC_TYPES: DocumentType[] = [
  'Loan Approval Letter',
  'Loan Section Letter',
  'TDS Deduction Intimation',
  'GST Letter',
];

/**
 * Resolve a template for the given docType.
 * Optionally accepts a pre-resolved template or a lookup function for custom templates.
 */
function resolveTemplate(
  docType: DocumentType | string,
  templateOverride?: Template,
  getTemplateById?: (id: string) => Template | undefined
): Template {
  if (templateOverride) return templateOverride;

  if (getTemplateById) {
    const found = getTemplateById(docType);
    if (found) return found;
  }

  if ((BUILT_IN_DOC_TYPES as string[]).includes(docType)) {
    return getTemplate(docType as DocumentType);
  }

  return getTemplate('Loan Approval Letter');
}

/**
 * Encode a string to UTF-8 bytes.
 */
function strToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Concatenate multiple Uint8Arrays into one with a guaranteed ArrayBuffer backing.
 */
function concatBytes(...arrays: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(new ArrayBuffer(total));
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Extract raw JPEG bytes from a canvas.
 */
async function canvasToJpegBytes(canvas: HTMLCanvasElement): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        blob
          .arrayBuffer()
          .then((buf) => resolve(new Uint8Array(buf as ArrayBuffer)))
          .catch(reject);
      },
      'image/jpeg',
      0.95
    );
  });
}

/**
 * Build a minimal valid PDF that embeds a JPEG image filling an A4 page.
 * Uses raw PDF syntax — no external library required.
 *
 * A4 at 72 DPI: 595.28 x 841.89 points
 */
function buildPdfFromJpeg(
  jpegBytes: Uint8Array<ArrayBuffer>,
  imgWidth: number,
  imgHeight: number
): Uint8Array<ArrayBuffer> {
  const pageW = 595.28;
  const pageH = 841.89;

  const offsets: number[] = [];
  const parts: Uint8Array[] = [];
  let pos = 0;

  const push = (str: string) => {
    const bytes = strToBytes(str);
    parts.push(bytes);
    pos += bytes.length;
  };

  const pushBytes = (bytes: Uint8Array) => {
    parts.push(bytes);
    pos += bytes.length;
  };

  // PDF header
  push('%PDF-1.4\n');
  push('%\xFF\xFF\xFF\xFF\n');

  // Object 1: Catalog
  offsets[1] = pos;
  push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages
  offsets[2] = pos;
  push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Object 3: Page
  offsets[3] = pos;
  push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] ` +
      `/Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );

  // Object 4: Image XObject (JPEG)
  offsets[4] = pos;
  push(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  pushBytes(jpegBytes);
  push('\nendstream\nendobj\n');

  // Object 5: Content stream — draw image filling the page
  const contentStr = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im1 Do Q\n`;
  const contentBytes = strToBytes(contentStr);
  offsets[5] = pos;
  push(`5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
  pushBytes(contentBytes);
  push('\nendstream\nendobj\n');

  // Cross-reference table
  const xrefOffset = pos;
  push('xref\n');
  push('0 6\n');
  push('0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) {
    push(offsets[i].toString().padStart(10, '0') + ' 00000 n \n');
  }

  // Trailer
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return concatBytes(...parts);
}

/**
 * Generate a PDF blob for the given document type and form data.
 */
export async function generatePdf(
  docType: DocumentType | string,
  formData: import('../../types/form').FormData,
  templateOverride?: Template,
  getTemplateById?: (id: string) => Template | undefined
): Promise<Blob> {
  const template = resolveTemplate(docType, templateOverride, getTemplateById);

  // Create an offscreen canvas and render the document into it
  const canvas = document.createElement('canvas');
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;

  await renderDocumentToCanvas(canvas, template, formData, docType);

  const jpegBytes = await canvasToJpegBytes(canvas);
  const pdfBytes = buildPdfFromJpeg(jpegBytes, canvas.width, canvas.height);

  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
