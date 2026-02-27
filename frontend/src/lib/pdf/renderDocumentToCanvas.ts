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

// Footer partner/brand images (200×80 each)
const FOOTER_IMAGE_PATHS = [
  '/assets/generated/footer-img-1.dim_200x80.png',
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

  // Divider line below header
  ctx.strokeStyle = '#1a56a0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGINS.left, headerBottomY);
  ctx.lineTo(PAGE_WIDTH - MARGINS.right, headerBottomY);
  ctx.stroke();
  ctx.lineWidth = 1;

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
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(rendered.headline, PAGE_WIDTH / 2, y);
  y += 36;

  // Body
  ctx.fillStyle = '#222222';
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';
  const lines = rendered.body.split('\n');
  const lineHeight = 17;
  const maxWidth = CONTENT_AREA.width;
  // Leave room for footer: images row + text row + dividers
  const maxY = PAGE_HEIGHT - FOOTER_TOTAL_HEIGHT - MARGINS.bottom;

  for (const line of lines) {
    if (y > maxY) break;
    ctx.fillText(line, MARGINS.left, y, maxWidth);
    y += lineHeight;
  }

  return y;
}

async function drawSignatureStampRow(
  ctx: CanvasRenderingContext2D,
  template: Template,
  startY: number
): Promise<number> {
  const hasSignature = !!(template.signature?.enabled && template.signature?.dataUrl);
  const hasSeal = !!(template.seal?.enabled && template.seal?.dataUrl);

  if (!hasSignature && !hasSeal) {
    return startY;
  }

  const rowTopY = startY + 20;
  const colGap = 40;
  const contentWidth = CONTENT_AREA.width;
  const colWidth = (contentWidth - colGap) / 2;
  const imgMaxH = 70;
  const labelHeight = 20;
  const rowHeight = imgMaxH + labelHeight + 16;

  const leftColX = MARGINS.left;
  const rightColX = MARGINS.left + colWidth + colGap;

  const drawImgCol = (
    dataUrl: string,
    colX: number,
    label: string,
    opacity: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = opacity / 100;
        const scale = Math.min(colWidth / img.width, imgMaxH / img.height);
        const imgW = img.width * scale;
        const imgH = img.height * scale;
        const imgX = colX + (colWidth - imgW) / 2;
        ctx.drawImage(img, imgX, rowTopY, imgW, imgH);
        ctx.restore();

        // Label
        ctx.save();
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(colX, rowTopY + imgMaxH + 4);
        ctx.lineTo(colX + colWidth, rowTopY + imgMaxH + 4);
        ctx.stroke();
        ctx.fillStyle = '#666666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(label, colX + colWidth / 2, rowTopY + imgMaxH + 8);
        ctx.restore();

        resolve();
      };
      img.onerror = () => resolve();
      img.src = dataUrl;
    });
  };

  const promises: Promise<void>[] = [];

  if (hasSignature && template.signature?.dataUrl) {
    promises.push(
      drawImgCol(
        template.signature.dataUrl,
        leftColX,
        template.signature.signatoryName || 'Authorized Signature',
        template.signature.opacity ?? 100
      )
    );
  }

  if (hasSeal && template.seal?.dataUrl) {
    const sealColX = hasSignature ? rightColX : leftColX;
    promises.push(
      drawImgCol(
        template.seal.dataUrl,
        sealColX,
        'Official Stamp',
        template.seal.opacity ?? 80
      )
    );
  }

  await Promise.all(promises);
  return rowTopY + rowHeight;
}

async function drawBajajFooter(ctx: CanvasRenderingContext2D): Promise<void> {
  const footerAreaBottom = PAGE_HEIGHT - MARGINS.bottom;

  // ── Top divider line ──
  const topDividerY = footerAreaBottom - FOOTER_TOTAL_HEIGHT;
  ctx.strokeStyle = '#1a56a0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGINS.left, topDividerY);
  ctx.lineTo(PAGE_WIDTH - MARGINS.right, topDividerY);
  ctx.stroke();
  ctx.lineWidth = 1;

  // ── Footer images row ──
  const imgRowY = topDividerY + FOOTER_DIVIDER_GAP;
  const contentWidth = PAGE_WIDTH - MARGINS.left - MARGINS.right;
  const numImages = FOOTER_IMAGE_PATHS.length;

  // Load all footer images in parallel
  const footerImgs = await Promise.all(FOOTER_IMAGE_PATHS.map((p) => loadImage(p)));

  // Evenly distribute images across the footer width
  const slotWidth = contentWidth / numImages;

  for (let i = 0; i < numImages; i++) {
    const img = footerImgs[i];
    if (!img) continue;

    // Scale image to fit within slot height
    const scale = Math.min(slotWidth * 0.8 / img.naturalWidth, FOOTER_IMG_HEIGHT / img.naturalHeight);
    const imgW = img.naturalWidth * scale;
    const imgH = img.naturalHeight * scale;

    // Center horizontally within slot, vertically within row
    const slotX = MARGINS.left + i * slotWidth;
    const imgX = slotX + (slotWidth - imgW) / 2;
    const imgY = imgRowY + (FOOTER_IMG_HEIGHT - imgH) / 2;

    ctx.drawImage(img, imgX, imgY, imgW, imgH);
  }

  // ── Bottom divider line ──
  const bottomDividerY = imgRowY + FOOTER_IMG_ROW_HEIGHT;
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGINS.left, bottomDividerY);
  ctx.lineTo(PAGE_WIDTH - MARGINS.right, bottomDividerY);
  ctx.stroke();

  // ── Footer text row ──
  const textY = bottomDividerY + FOOTER_DIVIDER_GAP;
  ctx.fillStyle = '#555555';
  ctx.font = '8px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(FOOTER_TEXT, MARGINS.left, textY);

  const dateText = `Generated: ${new Date().toLocaleDateString('en-IN')}`;
  ctx.textAlign = 'right';
  ctx.fillText(dateText, PAGE_WIDTH - MARGINS.right, textY);
}
