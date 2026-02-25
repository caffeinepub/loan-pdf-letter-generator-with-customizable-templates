import { Template } from '../../types/templates';
import { FormData } from '../../types/form';
import { renderTemplate } from '../templates/renderTemplate';
import { PAGE_WIDTH, PAGE_HEIGHT, MARGINS, CONTENT_AREA } from './layout';
import { getCanvasPosition } from '../templateAssets/positions';

export async function renderDocumentToCanvas(
  template: Template,
  formData: FormData,
  documentType: string
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // 1. Background image (if set)
  if (template.background?.dataUrl) {
    await drawBackgroundImage(ctx, {
      dataUrl: template.background.dataUrl,
      opacity: template.background.opacity,
      fit: template.background.fit,
    });
  }

  // 2. Watermark
  if (template.watermark) {
    drawAdvancedWatermark(ctx, template.watermark);
  } else if (template.watermarkText) {
    drawLegacyWatermark(ctx, template.watermarkText);
  }

  // 3. Two-column Header (Business Name/Address on left, Logo on right)
  let currentY = MARGINS.top;
  currentY = await drawTwoColumnHeader(ctx, template, currentY);

  // 4. Content
  const rendered = renderTemplate(template, formData);
  currentY = drawContent(ctx, rendered, currentY);

  // 5. Signature & Stamp — two-column row after body text
  currentY = await drawSignatureStampRow(ctx, template, currentY);

  // 6. Footer
  if (template.footerText) {
    drawFooter(ctx, template.footerText);
  }

  // 7. Generation date
  drawGenerationDate(ctx);

  return canvas;
}

async function drawBackgroundImage(
  ctx: CanvasRenderingContext2D,
  background: { dataUrl: string; opacity: number; fit: string }
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.globalAlpha = background.opacity;

      if (background.fit === 'cover') {
        const scale = Math.max(PAGE_WIDTH / img.width, PAGE_HEIGHT / img.height);
        const x = (PAGE_WIDTH - img.width * scale) / 2;
        const y = (PAGE_HEIGHT - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else if (background.fit === 'contain') {
        const scale = Math.min(PAGE_WIDTH / img.width, PAGE_HEIGHT / img.height);
        const x = (PAGE_WIDTH - img.width * scale) / 2;
        const y = (PAGE_HEIGHT - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else {
        ctx.drawImage(img, 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
      }

      ctx.restore();
      resolve();
    };
    img.onerror = () => resolve();
    img.src = background.dataUrl;
  });
}

function drawAdvancedWatermark(ctx: CanvasRenderingContext2D, watermark: NonNullable<Template['watermark']>): void {
  ctx.save();
  ctx.globalAlpha = watermark.opacity;
  ctx.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2);
  ctx.rotate((watermark.rotation * Math.PI) / 180);
  ctx.font = `bold ${watermark.size}px Arial`;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(watermark.text, 0, 0);
  ctx.restore();
}

function drawLegacyWatermark(ctx: CanvasRenderingContext2D, text: string): void {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2);
  ctx.rotate((-45 * Math.PI) / 180);
  ctx.font = 'bold 72px Arial';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

async function drawTwoColumnHeader(
  ctx: CanvasRenderingContext2D,
  template: Template,
  startY: number
): Promise<number> {
  const businessName = template.businessName?.trim() || '';
  const businessAddress = template.businessAddress?.trim() || '';
  const logoDataUrl = template.logoDataUrl;

  const hasLeft = businessName.length > 0 || businessAddress.length > 0;
  const hasRight = !!logoDataUrl;

  if (!hasLeft && !hasRight) {
    return startY;
  }

  const headerPaddingV = 16;
  const headerPaddingH = MARGINS.left;
  const dividerY = startY;

  const nameLineHeight = 22;
  const addrLineHeight = 16;
  const addrLines = businessAddress ? businessAddress.split('\n') : [];
  const textBlockHeight =
    (businessName ? nameLineHeight : 0) +
    addrLines.length * addrLineHeight;

  const logoMaxHeight = 56;
  const logoMaxWidth = 160;

  let logoWidth = 0;
  let logoHeight = 0;
  let logoImg: HTMLImageElement | null = null;

  if (hasRight) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(logoMaxHeight / img.height, logoMaxWidth / img.width);
        logoWidth = img.width * scale;
        logoHeight = img.height * scale;
        logoImg = img;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = logoDataUrl!;
    });
  }

  const contentHeight = Math.max(textBlockHeight, logoHeight);
  const headerHeight = contentHeight + headerPaddingV * 2;

  const headerBottomY = dividerY + headerHeight;
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGINS.left, headerBottomY);
  ctx.lineTo(PAGE_WIDTH - MARGINS.right, headerBottomY);
  ctx.stroke();

  const leftX = headerPaddingH;
  const rightLogoWidth = hasRight ? logoWidth + 16 : 0;
  const leftMaxWidth = PAGE_WIDTH - leftX - rightLogoWidth - MARGINS.right;

  let textY = dividerY + headerPaddingV + (contentHeight - textBlockHeight) / 2;

  if (businessName) {
    ctx.save();
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(businessName, leftX, textY, leftMaxWidth);
    ctx.restore();
    textY += nameLineHeight;
  }

  if (addrLines.length > 0) {
    ctx.save();
    ctx.fillStyle = '#555555';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    addrLines.forEach((line) => {
      ctx.fillText(line, leftX, textY, leftMaxWidth);
      textY += addrLineHeight;
    });
    ctx.restore();
  }

  if (logoImg && logoWidth > 0 && logoHeight > 0) {
    const logoX = PAGE_WIDTH - MARGINS.right - logoWidth;
    const logoY = dividerY + headerPaddingV + (contentHeight - logoHeight) / 2;
    ctx.drawImage(logoImg as HTMLImageElement, logoX, logoY, logoWidth, logoHeight);
  }

  return headerBottomY + 16;
}

function drawContent(
  ctx: CanvasRenderingContext2D,
  rendered: { headline: string; body: string },
  startY: number
): number {
  let y = startY + 20;

  // Headline
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(rendered.headline, PAGE_WIDTH / 2, y);
  y += 40;

  // Body
  ctx.fillStyle = '#222222';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  const lines = rendered.body.split('\n');
  const lineHeight = 20;
  const maxWidth = CONTENT_AREA.width;

  lines.forEach((line) => {
    if (y > PAGE_HEIGHT - 250) return;
    ctx.fillText(line, MARGINS.left, y, maxWidth);
    y += lineHeight;
  });

  return y;
}

async function drawSignatureStampRow(
  ctx: CanvasRenderingContext2D,
  template: Template,
  startY: number
): Promise<number> {
  const hasSignature = !!(template.signature?.dataUrl);
  const hasSeal = !!(template.seal?.dataUrl);

  if (!hasSignature && !hasSeal) {
    return startY;
  }

  const rowTopY = startY + 20;
  const colGap = 40;
  const contentWidth = CONTENT_AREA.width;
  const colWidth = (contentWidth - colGap) / 2;
  const imgMaxH = 80;
  const labelHeight = 20;
  const rowHeight = imgMaxH + labelHeight + 16;

  const leftColX = MARGINS.left;
  const rightColX = MARGINS.left + colWidth + colGap;

  const drawImgCol = (
    dataUrl: string,
    colX: number,
    label: string
  ): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(colWidth / img.width, imgMaxH / img.height);
        const imgW = img.width * scale;
        const imgH = img.height * scale;
        const imgX = colX + (colWidth - imgW) / 2;
        const imgY = rowTopY;

        ctx.drawImage(img, imgX, imgY, imgW, imgH);

        const lineY = rowTopY + imgMaxH + 4;
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(colX, lineY);
        ctx.lineTo(colX + colWidth, lineY);
        ctx.stroke();

        ctx.fillStyle = '#666666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, colX + colWidth / 2, lineY + 14);

        resolve();
      };
      img.onerror = () => resolve();
      img.src = dataUrl;
    });
  };

  const promises: Promise<void>[] = [];

  if (hasSignature && template.signature!.dataUrl) {
    promises.push(drawImgCol(template.signature!.dataUrl, leftColX, 'Authorized Signature'));
  }

  if (hasSeal && template.seal!.dataUrl) {
    promises.push(drawImgCol(template.seal!.dataUrl, rightColX, 'Official Stamp'));
  }

  await Promise.all(promises);

  return rowTopY + rowHeight;
}

function drawFooter(ctx: CanvasRenderingContext2D, footerText: string): void {
  const y = PAGE_HEIGHT - 80;
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGINS.left, y);
  ctx.lineTo(PAGE_WIDTH - MARGINS.right, y);
  ctx.stroke();

  ctx.fillStyle = '#666666';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  const lines = footerText.split('\n');
  lines.forEach((line, index) => {
    ctx.fillText(line, PAGE_WIDTH / 2, y + 15 + index * 12);
  });
}

function drawGenerationDate(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#999999';
  ctx.font = 'italic 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(
    `Generated on ${new Date().toLocaleDateString()}`,
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 30
  );
}
