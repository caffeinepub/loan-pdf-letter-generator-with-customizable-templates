import { Template } from '../../types/templates';
import { FormData } from '../../types/form';
import { renderTemplate } from '../templates/renderTemplate';
import {
  A4_WIDTH_PX,
  A4_HEIGHT_PX,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  MARGIN_TOP,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  CONTENT_START_Y,
  CONTENT_END_Y,
  CONTENT_WIDTH,
} from './layout';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = text.split('\n');
  let currentY = y;

  for (const line of lines) {
    if (line.trim() === '') {
      currentY += lineHeight * 0.6;
      continue;
    }
    const words = line.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        ctx.fillText(currentLine, x, currentY);
        currentLine = word;
        currentY += lineHeight;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      ctx.fillText(currentLine, x, currentY);
      currentY += lineHeight;
    }
  }

  return currentY;
}

export async function renderDocumentToCanvas(
  template: Template,
  formData: FormData
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = A4_WIDTH_PX;
  canvas.height = A4_HEIGHT_PX;

  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);

  // ─── HEADER ───────────────────────────────────────────────────────────────
  const headerColor = template.headerColor || '#003087';
  ctx.fillStyle = headerColor;
  ctx.fillRect(0, 0, A4_WIDTH_PX, HEADER_HEIGHT);

  // Try to load logo
  try {
    const logoImg = await loadImage('/assets/generated/bajaj-finserv-logo.dim_400x200.png');
    const logoH = 60;
    const logoW = (logoImg.width / logoImg.height) * logoH;
    ctx.drawImage(logoImg, MARGIN_LEFT, (HEADER_HEIGHT - logoH) / 2, logoW, logoH);
  } catch {
    // Fallback text logo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText(template.businessName || 'Bajaj Finserv', MARGIN_LEFT, HEADER_HEIGHT / 2 + 8);
  }

  // Right side of header: business address
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'right';
  const addrLines = (template.businessAddress || '').split(',');
  addrLines.forEach((line, i) => {
    ctx.fillText(line.trim(), A4_WIDTH_PX - MARGIN_RIGHT, 30 + i * 16);
  });
  ctx.textAlign = 'left';

  // ─── WATERMARK ────────────────────────────────────────────────────────────
  if (template.showWatermark && template.watermarkText) {
    ctx.save();
    ctx.globalAlpha = template.watermarkOpacity || 0.08;
    ctx.font = 'bold 80px Inter, sans-serif';
    ctx.fillStyle = '#888888';
    ctx.textAlign = 'center';
    ctx.translate(A4_WIDTH_PX / 2, A4_HEIGHT_PX / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.fillText(template.watermarkText, 0, 0);
    ctx.restore();
  }

  // ─── DOCUMENT TITLE ───────────────────────────────────────────────────────
  const { headline, body } = renderTemplate(template, formData);

  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(headline, A4_WIDTH_PX / 2, CONTENT_START_Y);
  ctx.textAlign = 'left';

  // Divider under title
  ctx.strokeStyle = headerColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGIN_LEFT, CONTENT_START_Y + 10);
  ctx.lineTo(A4_WIDTH_PX - MARGIN_RIGHT, CONTENT_START_Y + 10);
  ctx.stroke();

  // Date line
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  ctx.fillStyle = '#555555';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Date: ${today}`, A4_WIDTH_PX - MARGIN_RIGHT, CONTENT_START_Y + 30);
  ctx.textAlign = 'left';

  // ─── BODY CONTENT ─────────────────────────────────────────────────────────
  ctx.fillStyle = '#222222';
  ctx.font = '12px Inter, sans-serif';
  const bodyStartY = CONTENT_START_Y + 50;
  wrapText(ctx, body, MARGIN_LEFT, bodyStartY, CONTENT_WIDTH, 20);

  // ─── SIGNATURE AREA ───────────────────────────────────────────────────────
  const sigY = CONTENT_END_Y - 60;
  if (template.signature?.enabled && template.signature.dataUrl) {
    try {
      const sigImg = await loadImage(template.signature.dataUrl);
      const sigH = 40;
      const sigW = (sigImg.width / sigImg.height) * sigH;
      if (template.signatureLayout === 'sideBySide') {
        ctx.drawImage(sigImg, MARGIN_LEFT, sigY, sigW, sigH);
      } else {
        ctx.drawImage(sigImg, MARGIN_LEFT, sigY, sigW, sigH);
      }
    } catch {
      // skip
    }
  }

  if (template.seal?.enabled && template.seal.dataUrl) {
    try {
      const sealImg = await loadImage(template.seal.dataUrl);
      const sealSize = template.seal.size || 80;
      ctx.drawImage(
        sealImg,
        A4_WIDTH_PX - MARGIN_RIGHT - sealSize,
        sigY - sealSize / 2,
        sealSize,
        sealSize
      );
    } catch {
      // skip
    }
  }

  // ─── FOOTER ───────────────────────────────────────────────────────────────
  const footerStartY = A4_HEIGHT_PX - FOOTER_HEIGHT;

  // Blue top divider
  ctx.fillStyle = headerColor;
  ctx.fillRect(0, footerStartY, A4_WIDTH_PX, 4);

  // Footer images: row 1 = 4 images, row 2 = 3 images
  const footerImgSources = [
    '/assets/generated/footer-img-1.dim_200x80.png',
    '/assets/generated/footer-img-2.dim_200x80.png',
    '/assets/generated/footer-img-3.dim_200x80.png',
    '/assets/generated/footer-img-4.dim_200x80.png',
  ];

  const row1Images = footerImgSources;
  const row2Images = footerImgSources.slice(0, 3);

  const imgH = 72;
  const row1Y = footerStartY + 10;
  const row2Y = row1Y + imgH + 8;

  // Row 1: 4 images evenly spaced
  const row1TotalW = A4_WIDTH_PX - MARGIN_LEFT - MARGIN_RIGHT;
  const row1ImgW = row1TotalW / row1Images.length - 8;
  for (let i = 0; i < row1Images.length; i++) {
    try {
      const img = await loadImage(row1Images[i]);
      const x = MARGIN_LEFT + i * (row1ImgW + 8);
      ctx.drawImage(img, x, row1Y, row1ImgW, imgH);
    } catch {
      // Draw placeholder
      ctx.fillStyle = '#f0f0f0';
      const x = MARGIN_LEFT + i * (row1ImgW + 8);
      ctx.fillRect(x, row1Y, row1ImgW, imgH);
    }
  }

  // Thin separator between rows
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN_LEFT, row2Y - 4);
  ctx.lineTo(A4_WIDTH_PX - MARGIN_RIGHT, row2Y - 4);
  ctx.stroke();

  // Row 2: 3 images evenly spaced
  const row2TotalW = A4_WIDTH_PX - MARGIN_LEFT - MARGIN_RIGHT;
  const row2ImgW = row2TotalW / row2Images.length - 8;
  for (let i = 0; i < row2Images.length; i++) {
    try {
      const img = await loadImage(row2Images[i]);
      const x = MARGIN_LEFT + i * (row2ImgW + 8);
      ctx.drawImage(img, x, row2Y, row2ImgW, imgH);
    } catch {
      ctx.fillStyle = '#f0f0f0';
      const x = MARGIN_LEFT + i * (row2ImgW + 8);
      ctx.fillRect(x, row2Y, row2ImgW, imgH);
    }
  }

  // Grey bottom divider
  ctx.fillStyle = '#cccccc';
  ctx.fillRect(0, A4_HEIGHT_PX - 28, A4_WIDTH_PX, 2);

  // Footer text
  ctx.fillStyle = '#555555';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    template.footerText || 'Bajaj Finserv | www.bajajfinserv.in',
    A4_WIDTH_PX / 2,
    A4_HEIGHT_PX - 14
  );
  ctx.fillText(`Generated on ${today}`, A4_WIDTH_PX / 2, A4_HEIGHT_PX - 4);
  ctx.textAlign = 'left';

  return canvas;
}
