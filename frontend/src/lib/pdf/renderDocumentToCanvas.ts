import { Template } from '../../types/templates';
import { FormData } from '../../types/form';
import { renderTemplate } from '../templates/renderTemplate';
import { PAGE_WIDTH, PAGE_HEIGHT, MARGINS, HEADER_HEIGHT } from './layout';

// ── Bajaj Finance Limited header image ────────────────────────────────────────
const BAJAJ_HEADER_IMAGE_PATH =
  '/assets/Corporate Office, Off Pune-Ahmednagar Road, Viman Nagar, Pune - 411014 Baja_20260228_134953_0000-2.png';

// ── Bajaj Finance Limited footer image ───────────────────────────────────────
const BAJAJ_FOOTER_IMAGE_PATH =
  '/assets/Corporate Office, Off Pune-Ahmednagar Road, Viman Nagar, Pune - 411014 Baja_20260228_134953_0001-1.png';

// ── Bajaj Finance watermark image (FB logo) ───────────────────────────────────
const BAJAJ_WATERMARK_IMAGE_PATH = '/assets/images (15).jpeg';

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

  // 2. Watermark text (if enabled)
  if (template.watermark?.enabled && template.watermark.text) {
    drawWatermark(ctx, template.watermark);
  }

  // 3. Bajaj Finance logo watermark image — only for Loan Approval Letter
  const isLoanApprovalLetter = documentType === 'Loan Approval Letter';
  if (isLoanApprovalLetter) {
    await drawBajajLogoWatermark(ctx);
  }

  // 4. Bajaj Finance Limited header image — drawn at (0, 0) with zero margin/padding
  let currentY = await drawBajajHeaderImage(ctx);

  // 5. Content
  const rendered = renderTemplate(template, formData);
  if (isLoanApprovalLetter) {
    currentY = drawLoanApprovalContent(ctx, rendered, currentY);
  } else {
    currentY = drawContent(ctx, rendered, currentY);
  }

  // 6. Signature & Stamp row
  currentY = await drawSignatureStampRow(ctx, template, currentY);

  // 7. Footer image — drawn at the bottom of the page
  await drawBajajFooterImage(ctx);

  return canvas;
}

/**
 * Draws the Bajaj Finance FB logo as a centered watermark with low opacity.
 * Only applied to the Loan Approval Letter document type.
 */
async function drawBajajLogoWatermark(ctx: CanvasRenderingContext2D): Promise<void> {
  const watermarkImg = await loadImage(BAJAJ_WATERMARK_IMAGE_PATH);
  if (!watermarkImg) return;

  const size = PAGE_WIDTH * 0.4;
  const x = (PAGE_WIDTH - size) / 2;
  const y = (PAGE_HEIGHT - size) / 2;

  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.drawImage(watermarkImg, x, y, size, size);
  ctx.restore();
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

/**
 * Draws the Bajaj Finance Limited header image at canvas position (0, 0)
 * spanning the full canvas width with no margin or padding.
 * Returns the Y position immediately below the header image.
 */
async function drawBajajHeaderImage(ctx: CanvasRenderingContext2D): Promise<number> {
  const headerImg = await loadImage(BAJAJ_HEADER_IMAGE_PATH);

  if (headerImg) {
    const aspectRatio = headerImg.naturalHeight / headerImg.naturalWidth;
    const renderedHeight = Math.round(PAGE_WIDTH * aspectRatio);
    ctx.drawImage(headerImg, 0, 0, PAGE_WIDTH, renderedHeight);
    return renderedHeight;
  }

  return HEADER_HEIGHT;
}

/**
 * Draws the footer image at the bottom of the page spanning the full canvas width.
 */
async function drawBajajFooterImage(ctx: CanvasRenderingContext2D): Promise<void> {
  const footerImg = await loadImage(BAJAJ_FOOTER_IMAGE_PATH);

  if (!footerImg) return;

  const aspectRatio = footerImg.naturalHeight / footerImg.naturalWidth;
  const renderedHeight = Math.round(PAGE_WIDTH * aspectRatio);
  const footerY = PAGE_HEIGHT - renderedHeight;

  ctx.drawImage(footerImg, 0, footerY, PAGE_WIDTH, renderedHeight);
}

// ── Segment types for rich text rendering ────────────────────────────────────
interface TextSegment {
  text: string;
  bold?: boolean;
  color?: string;
  highlight?: string; // background fill color
}

/**
 * Measures the total pixel width of an array of segments.
 */
function measureSegments(
  ctx: CanvasRenderingContext2D,
  segments: TextSegment[],
  baseFontSize: number
): number {
  let total = 0;
  for (const seg of segments) {
    ctx.font = seg.bold ? `bold ${baseFontSize}px Arial` : `${baseFontSize}px Arial`;
    total += ctx.measureText(seg.text).width;
  }
  return total;
}

/**
 * Draws an array of text segments starting at (x, y).
 * Returns the x position after the last segment.
 */
function drawSegments(
  ctx: CanvasRenderingContext2D,
  segments: TextSegment[],
  x: number,
  y: number,
  baseFontSize: number
): number {
  let curX = x;
  for (const seg of segments) {
    const font = seg.bold ? `bold ${baseFontSize}px Arial` : `${baseFontSize}px Arial`;
    ctx.font = font;
    const w = ctx.measureText(seg.text).width;

    if (seg.highlight) {
      ctx.save();
      ctx.fillStyle = seg.highlight;
      ctx.fillRect(curX - 1, y - 1, w + 2, baseFontSize + 4);
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = seg.color ?? '#222222';
    ctx.fillText(seg.text, curX, y);
    ctx.restore();

    curX += w;
  }
  return curX;
}

/**
 * Parses a line into text segments, applying bold/highlight to ₹ amounts and % values.
 */
function parseFinancialLine(line: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const parts = line.split(/(₹[\d,]+(?:\.\d+)?|\d+(?:\.\d+)?%)/g);
  for (const part of parts) {
    if (/^₹[\d,]+/.test(part)) {
      segments.push({ text: part, bold: true, color: '#78350f', highlight: '#fef08a' });
    } else if (/^\d+(?:\.\d+)?%$/.test(part)) {
      segments.push({ text: part, bold: true, color: '#1e3a8a', highlight: '#fef08a' });
    } else {
      segments.push({ text: part });
    }
  }
  return segments;
}

/**
 * Word-wraps text and draws it, returning the new Y after all lines.
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  font: string,
  color: string
): number {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const words = text.split(' ');
  let currentLine = '';
  let currentY = y;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      ctx.fillText(currentLine, x, currentY);
      currentY += lineHeight;
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    ctx.fillText(currentLine, x, currentY);
    currentY += lineHeight;
  }

  ctx.restore();
  return currentY;
}

/**
 * Word-wraps rich financial segments (with highlights) within maxWidth.
 * Splits on word boundaries within plain-text segments, keeping special
 * segments (₹ amounts, % values) atomic. Returns new Y after all lines.
 */
function drawWrappedSegments(
  ctx: CanvasRenderingContext2D,
  segments: TextSegment[],
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  baseFontSize: number
): number {
  // Tokenize all segments into atomic word-tokens preserving segment styling
  interface Token {
    text: string;
    bold?: boolean;
    color?: string;
    highlight?: string;
  }

  const tokens: Token[] = [];
  for (const seg of segments) {
    if (seg.bold || seg.highlight) {
      // Keep special segments atomic (don't split ₹ amounts or % values)
      tokens.push({ text: seg.text, bold: seg.bold, color: seg.color, highlight: seg.highlight });
    } else {
      // Split plain text on spaces, preserving spaces as separate tokens
      const words = seg.text.split(/(\s+)/);
      for (const w of words) {
        if (w.length > 0) {
          tokens.push({ text: w, color: seg.color });
        }
      }
    }
  }

  // Build lines by accumulating tokens until maxWidth is exceeded
  const lines: Token[][] = [];
  let currentLineTokens: Token[] = [];
  let currentLineWidth = 0;

  for (const token of tokens) {
    ctx.font = token.bold ? `bold ${baseFontSize}px Arial` : `${baseFontSize}px Arial`;
    const tokenWidth = ctx.measureText(token.text).width;

    // Skip leading whitespace on a new line
    if (currentLineTokens.length === 0 && /^\s+$/.test(token.text)) {
      continue;
    }

    if (currentLineWidth + tokenWidth > maxWidth && currentLineTokens.length > 0) {
      // Trim trailing whitespace tokens from current line
      while (currentLineTokens.length > 0 && /^\s+$/.test(currentLineTokens[currentLineTokens.length - 1].text)) {
        currentLineTokens.pop();
      }
      lines.push(currentLineTokens);
      currentLineTokens = /^\s+$/.test(token.text) ? [] : [token];
      currentLineWidth = /^\s+$/.test(token.text) ? 0 : tokenWidth;
    } else {
      currentLineTokens.push(token);
      currentLineWidth += tokenWidth;
    }
  }

  // Push last line
  if (currentLineTokens.length > 0) {
    while (currentLineTokens.length > 0 && /^\s+$/.test(currentLineTokens[currentLineTokens.length - 1].text)) {
      currentLineTokens.pop();
    }
    if (currentLineTokens.length > 0) {
      lines.push(currentLineTokens);
    }
  }

  // Draw each line
  ctx.save();
  ctx.textBaseline = 'top';
  let currentY = y;
  for (const lineTokens of lines) {
    drawSegments(ctx, lineTokens, x, currentY, baseFontSize);
    currentY += lineHeight;
  }
  ctx.restore();

  return currentY;
}

/**
 * Draws a label + highlighted value on one line.
 * Returns new Y after the line.
 */
function drawLabelHighlightLine(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  baseFontSize: number,
  lineHeight: number,
  labelColor: string = '#111111',
  valueHighlight: string = '#fef08a',
  valueColor: string = '#78350f'
): number {
  ctx.save();
  ctx.font = `bold ${baseFontSize}px Arial`;
  ctx.fillStyle = labelColor;
  ctx.textBaseline = 'top';
  const labelW = ctx.measureText(label).width;
  ctx.fillText(label, x, y);

  // Highlight background for value
  ctx.font = `bold ${baseFontSize}px Arial`;
  const valW = ctx.measureText(value).width;
  ctx.fillStyle = valueHighlight;
  ctx.fillRect(x + labelW - 1, y - 1, valW + 4, baseFontSize + 4);

  ctx.fillStyle = valueColor;
  ctx.fillText(value, x + labelW, y);
  ctx.restore();
  return y + lineHeight;
}

/**
 * Draws the Loan Approval Letter body with bold/highlighted formatting.
 * Handles the new template structure: Application Number, Loan Number, Subject,
 * greeting, approval paragraph, EMI details, Processing & Verification section,
 * refundable notice, Bank Account Details section, bullet list, closing.
 */
function drawLoanApprovalContent(
  ctx: CanvasRenderingContext2D,
  rendered: { headline: string; body: string },
  startY: number
): number {
  const leftX = MARGINS.left;
  const rightX = PAGE_WIDTH - MARGINS.right;
  const contentWidth = rightX - leftX;
  let currentY = startY + 20;
  const lineHeight = 18;
  const baseFontSize = 11;

  // ── Title ──────────────────────────────────────────────────────────────────
  ctx.save();
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  // Center the title within the content area
  const titleWidth = ctx.measureText(rendered.headline).width;
  const titleX = leftX + Math.max(0, (contentWidth - titleWidth) / 2);
  // Clamp to content area if title is wider than content
  const clampedTitleX = Math.max(leftX, titleX);
  ctx.fillText(rendered.headline, clampedTitleX, currentY, contentWidth);
  ctx.restore();
  currentY += 30;

  // ── Body lines ─────────────────────────────────────────────────────────────
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const lines = rendered.body.split('\n');

  for (const line of lines) {
    // Empty line → small spacer
    if (line.trim() === '') {
      currentY += lineHeight * 0.4;
      continue;
    }

    // ── Application Number line ───────────────────────────────────────────────
    if (line.startsWith('Application Number:')) {
      const label = 'Application Number:';
      const value = line.slice(label.length);
      currentY = drawLabelHighlightLine(
        ctx, label, value, leftX, currentY, baseFontSize, lineHeight,
        '#111111', '#fef08a', '#b45309'
      );
      continue;
    }

    // ── Loan Number line ──────────────────────────────────────────────────────
    if (line.startsWith('Loan Number:')) {
      const label = 'Loan Number:';
      const value = line.slice(label.length);
      currentY = drawLabelHighlightLine(
        ctx, label, value, leftX, currentY, baseFontSize, lineHeight,
        '#111111', '#fef08a', '#b45309'
      );
      continue;
    }

    // ── Subject line ──────────────────────────────────────────────────────────
    if (line.startsWith('Subject:')) {
      currentY = drawWrappedText(
        ctx, line, leftX, currentY,
        contentWidth, lineHeight,
        `bold ${baseFontSize}px Arial`, '#111111'
      );
      continue;
    }

    // ── "Processing & Verification" section heading ───────────────────────────
    if (line.trim() === 'Processing & Verification') {
      currentY += 4;
      ctx.save();
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#1d4ed8';
      ctx.textBaseline = 'top';
      ctx.fillText(line, leftX, currentY);
      // Underline
      const textW = ctx.measureText(line).width;
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftX, currentY + 14);
      ctx.lineTo(leftX + textW, currentY + 14);
      ctx.stroke();
      ctx.restore();
      currentY += lineHeight + 4;
      continue;
    }

    // ── "Bank Account Details" section heading ────────────────────────────────
    if (line.trim() === 'Bank Account Details') {
      currentY += 4;
      ctx.save();
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#1d4ed8';
      ctx.textBaseline = 'top';
      ctx.fillText(line, leftX, currentY);
      // Underline
      const textW = ctx.measureText(line).width;
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftX, currentY + 14);
      ctx.lineTo(leftX + textW, currentY + 14);
      ctx.stroke();
      ctx.restore();
      currentY += lineHeight + 4;
      continue;
    }

    // ── Refundable notice (starts with colon) ─────────────────────────────────
    if (line.startsWith(':The processing charge is fully refundable')) {
      const noticeText = line.slice(1).trim();
      const boxPad = 6;
      // Estimate height needed for wrapped text
      ctx.save();
      ctx.font = `bold ${baseFontSize}px Arial`;
      const words = noticeText.split(' ');
      let testLine = '';
      let lineCount = 1;
      for (const word of words) {
        const tl = testLine ? `${testLine} ${word}` : word;
        if (ctx.measureText(tl).width > contentWidth - boxPad * 2 && testLine) {
          lineCount++;
          testLine = word;
        } else {
          testLine = tl;
        }
      }
      const boxHeight = lineCount * lineHeight + boxPad * 2;

      // Green highlight background — constrained to content area
      ctx.fillStyle = '#d1fae5';
      ctx.fillRect(leftX, currentY - boxPad, contentWidth, boxHeight);
      // Green border
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 1;
      ctx.strokeRect(leftX, currentY - boxPad, contentWidth, boxHeight);
      ctx.restore();

      // Draw wrapped text inside box
      currentY = drawWrappedText(
        ctx, noticeText, leftX + boxPad, currentY,
        contentWidth - boxPad * 2, lineHeight,
        `bold ${baseFontSize}px Arial`, '#065f46'
      );
      currentY += boxPad + 4;
      continue;
    }

    // ── Bank Account Number ───────────────────────────────────────────────────
    if (line.startsWith('Bank Account Number:')) {
      const label = 'Bank Account Number:';
      const value = line.slice(label.length);
      currentY = drawLabelHighlightLine(
        ctx, label, value, leftX, currentY, baseFontSize, lineHeight
      );
      continue;
    }

    // ── IFSC Code ─────────────────────────────────────────────────────────────
    if (line.startsWith('IFSC Code:')) {
      const label = 'IFSC Code:';
      const value = line.slice(label.length);
      currentY = drawLabelHighlightLine(
        ctx, label, value, leftX, currentY, baseFontSize, lineHeight
      );
      continue;
    }

    // ── UPI ID ────────────────────────────────────────────────────────────────
    if (line.startsWith('UPI ID:')) {
      const label = 'UPI ID:';
      const value = line.slice(label.length);
      currentY = drawLabelHighlightLine(
        ctx, label, value, leftX, currentY, baseFontSize, lineHeight
      );
      continue;
    }

    // ── Bullet point lines ────────────────────────────────────────────────────
    if (line.startsWith('•')) {
      const bulletText = line.slice(1).trim();
      const bulletIndent = 14;
      ctx.save();
      ctx.font = `bold ${baseFontSize}px Arial`;
      ctx.fillStyle = '#1d4ed8';
      ctx.textBaseline = 'top';
      ctx.fillText('•', leftX, currentY);
      ctx.restore();
      currentY = drawWrappedText(
        ctx, bulletText, leftX + bulletIndent, currentY,
        contentWidth - bulletIndent, lineHeight,
        `${baseFontSize}px Arial`, '#222222'
      );
      continue;
    }

    // ── Lines with ₹ amounts or % values — rich financial rendering ───────────
    if (line.includes('₹') || line.includes('%')) {
      const segments = parseFinancialLine(line);
      ctx.save();
      ctx.textBaseline = 'top';
      // Check if segments fit on one line; if not, use word-wrap
      const totalWidth = measureSegments(ctx, segments, baseFontSize);
      if (totalWidth <= contentWidth) {
        drawSegments(ctx, segments, leftX, currentY, baseFontSize);
        currentY += lineHeight;
      } else {
        currentY = drawWrappedSegments(
          ctx, segments, leftX, currentY,
          contentWidth, lineHeight, baseFontSize
        );
      }
      ctx.restore();
      continue;
    }

    // ── Default: plain text with word-wrap ────────────────────────────────────
    currentY = drawWrappedText(
      ctx, line, leftX, currentY,
      contentWidth, lineHeight,
      `${baseFontSize}px Arial`, '#222222'
    );
  }

  return currentY;
}

function drawContent(
  ctx: CanvasRenderingContext2D,
  rendered: { headline: string; body: string },
  startY: number
): number {
  const leftX = MARGINS.left;
  const contentWidth = PAGE_WIDTH - MARGINS.left - MARGINS.right;
  let currentY = startY + 20;

  // Title
  ctx.save();
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const titleWidth = ctx.measureText(rendered.headline).width;
  const titleX = leftX + Math.max(0, (contentWidth - titleWidth) / 2);
  ctx.fillText(rendered.headline, Math.max(leftX, titleX), currentY, contentWidth);
  ctx.restore();
  currentY += 30;

  // Body text
  const lines = rendered.body.split('\n');
  for (const line of lines) {
    if (line.trim() === '') {
      currentY += 7;
      continue;
    }
    currentY = drawWrappedText(
      ctx, line, leftX, currentY,
      contentWidth, 18,
      '11px Arial', '#222222'
    );
  }

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

  let currentY = startY + 30;
  const leftX = MARGINS.left;
  let colX = leftX;

  if (hasSignature && template.signature?.dataUrl) {
    const sigImg = await loadImage(template.signature.dataUrl);
    if (sigImg) {
      const maxH = 70;
      const maxW = 160;
      const scale = Math.min(maxW / sigImg.width, maxH / sigImg.height);
      const w = sigImg.width * scale;
      const h = sigImg.height * scale;
      const opacity = (template.signature.opacity ?? 100) / 100;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(sigImg, colX, currentY, w, h);
      ctx.restore();

      ctx.save();
      ctx.font = '10px Arial';
      ctx.fillStyle = '#555555';
      ctx.textBaseline = 'top';
      ctx.fillText(template.signature.signatoryName || 'Authorized Signature', colX, currentY + h + 4);
      ctx.restore();

      colX += w + 40;
    }
  }

  if (hasSeal && template.seal?.dataUrl) {
    const sealImg = await loadImage(template.seal.dataUrl);
    if (sealImg) {
      const maxH = 70;
      const maxW = 100;
      const scale = Math.min(maxW / sealImg.width, maxH / sealImg.height);
      const w = sealImg.width * scale;
      const h = sealImg.height * scale;
      const opacity = (template.seal.opacity ?? 80) / 100;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(sealImg, colX, currentY, w, h);
      ctx.restore();

      ctx.save();
      ctx.font = '10px Arial';
      ctx.fillStyle = '#555555';
      ctx.textBaseline = 'top';
      ctx.fillText('Official Stamp', colX, currentY + h + 4);
      ctx.restore();
    }
  }

  return currentY + 90;
}
