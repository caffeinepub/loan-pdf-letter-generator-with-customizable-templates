import { DocumentType, FormData } from '../../types/form';
import { getTemplate } from '../templates/getTemplate';
import { renderDocumentToCanvas } from './renderDocumentToCanvas';

export async function generatePdf(docType: DocumentType | string, formData: FormData): Promise<Blob> {
  const template = getTemplate(docType);
  const canvas = await renderDocumentToCanvas(template, formData, docType);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}
