import { Template } from '../../types/templates';
import { FormData } from '../../types/form';
import { renderTemplate } from '../templates/renderTemplate';
import { PAGE_WIDTH, PAGE_HEIGHT, MARGINS, CONTENT_AREA } from './layout';

// ── Hardcoded Bajaj Finserv branding ──────────────────────────────────────────
const BAJAJ_COMPANY_NAME = 'Bajaj Finserv Limited';
const BAJAJ_ADDRESS_LINES = [
  'Regd. Office',
  'Bajaj Auto Limited Complex',
  'Mumbai - Pune Road,',
  'Pune - 411035 MH (IN)',
  'Email ID: investors@bajajfinserv.in',
  'Corporate Identity Number (CIN)',
  'L65910MH1987PLC042961',
  'IRDAI Corporate Agency (Composite)',
];
// Use the exact uploaded Bajaj Finserv logo — no modifications
const BAJAJ_LOGO_PATH = '/assets/bajaj_finserv-logo_brandlogos.net_z2tuf-2.png';
const FOOTER_TEXT =
  'This document is system generated. For queries, contact investors@bajajfinserv.in';

// Footer partner/brand images — first image replaced with Dhani Finance LTD. signature block
const FOOTER_IMAGE_PATHS = [
  '/assets/20260228_092922_0002.png',
  '/assets/generated/footer-img-2.dim_200x80.png',
  '/assets/generated/footer-img-3.dim_200x80.png',
  '/assets/generated/footer-img-4.dim_200x80.png',
];

// Multiplier to increase logo size relative to the text block height
const LOGO_SIZE_MULTIPLIER = 1.4;

// Footer layout constants
const FOOTER_IMG_HEIGHT = 40;       // rendered height of each footer image on canvas
const FOOTER_IMG_ROW_HEIGHT = 56;   // total row height including padding
const FOOTER_TEXT_ROW_HEIGHT = 24;  // height for the text row at the bottom
const FOOTER_DIVIDER_GAP = 8;       // gap between divider and content
const FOOTER_TOTAL_HEIGHT =
  FOOTER_DIVIDER_GAP + FOOTER_IMG_ROW_HEIGHT + FOOTER_DIVIDER_GAP + FOOTER_TEXT_ROW_HEIGHT + 8;

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

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
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // 1. Background image (if enabled)
  if (template.background?.enabled && template.background.dataUrl) {
    await drawBackgroundImage(ctx, {
      dataUrl: template.background.dataUrl,
      opacity: template.background.opacity,
      fit: template.background.fit,
    });
  }

  // 2. Watermark (if enabled)
  if (template.watermark?.enabled && template.watermark.text) {
    drawWatermark(ctx, template.watermark);
  }

  // 3. Hardcoded Bajaj Finserv two-column header
  let currentY = MARGINS.top;
  currentY = await drawBajajHeader(ctx, currentY);

  // 4. Content
  const rendered = renderTemplate(template, formData);
  currentY = drawContent(ctx, rendered, currentY);

  // 5. Signature & Stamp row
  currentY = await drawSignatureStampRow(ctx, template, currentY);

  // 6. Hardcoded footer (with images)
  await drawBajajFooter(ctx);

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

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  watermark: NonNullable<Template['watermark']>
): void {
  ctx.save();
  ctx.globalAlpha = watermark.opacity;
  ctx.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2);
  ctx.rotate((watermark.rotation * Math.PI) / 180);
  ctx.font = `bold ${watermark.size}px Arial`;
  ctx.fillStyle = watermark.color ?? 'rgba(0,0,0,0.1)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(watermark.text, 0, 0);
  ctx.restore();
}

async function drawBajajHeader(
  ctx: CanvasRenderingContext2D,
  startY: number
): Promise<number> {
  const paddingH = MARGINS.left;
  const paddingV = 14;

  // Calculate left-side text block height precisely
  const nameLineHeight = 18;
  const addrLineHeight = 12;
  const textBlockHeight = nameLineHeight + BAJAJ_ADDRESS_LINES.length * addrLineHeight;

  // Load logo and scale it to be larger than the text block height
  const logoImg = await loadImage(BAJAJ_LOGO_PATH);
  let logoW = 0;
  let logoH = 0;

  if (logoImg) {
    // Scale logo height to be LOGO_SIZE_MULTIPLIER times the text block height
    logoH = Math.round(textBlockHeight * LOGO_SIZE_MULTIPLIER);
    const ratio = logoImg.naturalWidth / logoImg.naturalHeight;
    logoW = logoH * ratio;

    // Cap width to avoid overflow
    const maxLogoWidth = 300;
    if (logoW > maxLogoWidth) {
      logoW = maxLogoWidth;
      logoH = logoW / ratio;
    }
  }

  // Header height is based on the larger of text block or logo height
  const contentHeight = Math.max(textBlockHeight, logoH);
  const headerHeight = contentHeight + paddingV * 2;
  const headerBottomY = startY + headerHeight;

  // Draw company name (bold)
  let textY = startY + paddingV;
  ctx.save();
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const textAreaWidth = PAGE_WIDTH - paddingH * 2 - logoW - 20;
  ctx.fillText(BAJAJ_COMPANY_NAME, paddingH, textY, textAreaWidth);
  textY += nameLineHeight;

  // Draw address lines
  ctx.font = '9px Arial';
  ctx.fillStyle = '#333333';
  for (const line of BAJAJ_ADDRESS_LINES) {
    ctx.fillText(line, paddingH, textY, textAreaWidth);
    textY += addrLineHeight;
  }
  ctx.restore();

  // Draw logo exactly as-is (right-aligned, vertically centered within header)
  if (logoImg && logoW > 0 && logoH > 0) {
    const logoX = PAGE_WIDTH - MARGINS.right - logoW;
    const logoY = startY + paddingV + (contentHeight - logoH) / 2;
    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
  }

  // Blue divider line below header
  ctx.save();
  ctx.strokeStyle = '#1a56a0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGINS.left, headerBottomY);
  ctx.lineTo(PAGE_WIDTH - MARGINS.right, headerBottomY);
  ctx.stroke();
  ctx.restore();

  return headerBottomY + 10;
}

function drawContent(
  ctx: CanvasRenderingContext2D,
  rendered: { headline: string; body: string },
  startY: number
): number {
  const paddingH = MARGINS.left;
  const maxWidth = CONTENT_AREA.width;
  let currentY = startY + 10;

  // Draw headline (centered, bold)
  ctx.save();
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(rendered.headline, PAGE_WIDTH / 2, currentY, maxWidth);
  currentY += 28;
  ctx.restore();

  // Draw body text (left-aligned, wrapping)
  ctx.save();
  ctx.fillStyle = '#222222';
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const lineHeight = 18;
  const lines = rendered.body.split('\n');

  for (const line of lines) {
    if (line.trim() === '') {
      currentY += lineHeight * 0.6;
      continue;
    }

    // Word-wrap each line
    const words = line.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        ctx.fillText(currentLine, paddingH, currentY);
        currentY += lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      ctx.fillText(currentLine, paddingH, currentY);
      currentY += lineHeight;
    }
  }

  ctx.restore();
  return currentY;
}

async function drawSignatureStampRow(
  ctx: CanvasRenderingContext2D,
  template: Template,
  startY: number
): Promise<number> {
  const hasSignature = !!(template.signature?.enabled && template.signature?.dataUrl);
  const hasSeal = !!(template.seal?.enabled && template.seal?.dataUrl);

  if (!hasSignature && !hasSeal) return startY;

  const rowY = startY + 30;
  const imgMaxH = 70;
  const labelH = 20;
  const rowH = imgMaxH + labelH + 10;

  const items: Array<{ dataUrl: string; label: string; opacity: number }> = [];
  if (hasSignature && template.signature?.dataUrl) {
    items.push({
      dataUrl: template.signature.dataUrl,
      label: template.signature.signatoryName || 'Authorized Signature',
      opacity: (template.signature.opacity ?? 100) / 100,
    });
  }
  if (hasSeal && template.seal?.dataUrl) {
    items.push({
      dataUrl: template.seal.dataUrl,
      label: 'Official Stamp',
      opacity: (template.seal.opacity ?? 80) / 100,
    });
  }

  const colWidth = CONTENT_AREA.width / items.length;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const colX = MARGINS.left + i * colWidth;
    const centerX = colX + colWidth / 2;

    const img = await loadImage(item.dataUrl);
    if (img) {
      ctx.save();
      ctx.globalAlpha = item.opacity;
      const scale = Math.min(colWidth * 0.6 / img.width, imgMaxH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      ctx.drawImage(img, centerX - drawW / 2, rowY, drawW, drawH);
      ctx.restore();
    }

    // Label line
    const labelY = rowY + imgMaxH + 4;
    ctx.save();
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(colX + 10, labelY);
    ctx.lineTo(colX + colWidth - 10, labelY);
    ctx.stroke();

    ctx.fillStyle = '#666666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(item.label, centerX, labelY + 4);
    ctx.restore();
  }

  return rowY + rowH;
}

async function drawBajajFooter(ctx: CanvasRenderingContext2D): Promise<void> {
  const footerTopY = PAGE_HEIGHT - MARGINS.bottom - FOOTER_TOTAL_HEIGHT;

  // Blue top divider
  ctx.save();
  ctx.strokeStyle = '#1a56a0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGINS.left, footerTopY);
  ctx.lineTo(PAGE_WIDTH - MARGINS.right, footerTopY);
  ctx.stroke();
  ctx.restore();

  // Load all footer images in parallel
  const footerImgs = await Promise.all(FOOTER_IMAGE_PATHS.map(loadImage));

  // Draw footer images evenly distributed
  const imgRowY = footerTopY + FOOTER_DIVIDER_GAP;
  const totalWidth = PAGE_WIDTH - MARGINS.left - MARGINS.right;
  const slotWidth = totalWidth / FOOTER_IMAGE_PATHS.length;

  for (let i = 0; i < footerImgs.length; i++) {
    const img = footerImgs[i];
    if (!img) continue;

    const slotX = MARGINS.left + i * slotWidth;
    const centerX = slotX + slotWidth / 2;

    // Scale image to fit within slot while preserving aspect ratio
    const scale = Math.min(slotWidth * 0.8 / img.naturalWidth, FOOTER_IMG_HEIGHT / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;

    const drawX = centerX - drawW / 2;
    const drawY = imgRowY + (FOOTER_IMG_HEIGHT - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // Grey bottom divider
  const divider2Y = imgRowY + FOOTER_IMG_ROW_HEIGHT + FOOTER_DIVIDER_GAP;
  ctx.save();
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGINS.left, divider2Y);
  ctx.lineTo(PAGE_WIDTH - MARGINS.right, divider2Y);
  ctx.stroke();
  ctx.restore();

  // Footer text row
  const textY = divider2Y + 8;
  ctx.save();
  ctx.fillStyle = '#555555';
  ctx.font = '8px Arial';
  ctx.textBaseline = 'top';

  ctx.textAlign = 'left';
  ctx.fillText(FOOTER_TEXT, MARGINS.left, textY);

  ctx.textAlign = 'right';
  ctx.fillText(
    `Generated: ${new Date().toLocaleDateString('en-IN')}`,
    PAGE_WIDTH - MARGINS.right,
    textY
  );
  ctx.restore();
}
