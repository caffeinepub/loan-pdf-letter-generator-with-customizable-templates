import { Template } from '../../types/templates';
import { FormData } from '../../types/form';
import { renderTemplate } from '../templates/renderTemplate';
import { PAGE_WIDTH, PAGE_HEIGHT, MARGINS, HEADER_HEIGHT, FOOTER_HEIGHT } from './layout';

// ── Shared header/footer image paths ─────────────────────────────────────────
const BAJAJ_HEADER_IMAGE_PATH = '/assets/Header.png';
const BAJAJ_FOOTER_IMAGE_PATH = '/assets/Footer.png';

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Draws the shared Bajaj Finance header image at (0, 0) spanning full canvas width.
 * Returns the Y position immediately below the header.
 */
async function renderHeader(ctx: CanvasRenderingContext2D): Promise<number> {
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
 * Draws the shared Bajaj Finance footer image at the bottom of the page.
 */
async function renderFooter(ctx: CanvasRenderingContext2D): Promise<void> {
  const footerImg = await loadImage(BAJAJ_FOOTER_IMAGE_PATH);
  if (!footerImg) return;
  const aspectRatio = footerImg.naturalHeight / footerImg.naturalWidth;
  const renderedHeight = Math.round(PAGE_WIDTH * aspectRatio);
  const footerY = PAGE_HEIGHT - renderedHeight;
  ctx.drawImage(footerImg, 0, footerY, PAGE_WIDTH, renderedHeight);
}

/**
 * Draws the watermark image (if configured) or falls back to text watermark.
 * Renders behind all content.
 */
async function renderWatermark(ctx: CanvasRenderingContext2D, template: Template): Promise<void> {
  const watermark = template.watermark;
  if (!watermark || !watermark.enabled) return;

  // Try image watermark first
  if (watermark.watermarkImageUrl) {
    const wmImg = await loadImage(watermark.watermarkImageUrl);
    if (wmImg) {
      const wmWidth = PAGE_WIDTH * 0.5;
      const wmHeight = wmWidth * (wmImg.naturalHeight / wmImg.naturalWidth);
      const wmX = (PAGE_WIDTH - wmWidth) / 2;
      const wmY = HEADER_HEIGHT + (PAGE_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - wmHeight) / 2;
      ctx.save();
      ctx.globalAlpha = watermark.opacity;
      ctx.drawImage(wmImg, wmX, wmY, wmWidth, wmHeight);
      ctx.restore();
      return;
    }
  }

  // Text watermark fallback
  if (watermark.text) {
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

// ── Segment types for rich text rendering ────────────────────────────────────
interface TextSegment {
  text: string;
  bold?: boolean;
  color?: string;
  highlight?: string;
}

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

function drawWrappedSegments(
  ctx: CanvasRenderingContext2D,
  segments: TextSegment[],
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  baseFontSize: number
): number {
  interface Token {
    text: string;
    bold?: boolean;
    color?: string;
    highlight?: string;
  }

  const tokens: Token[] = [];
  for (const seg of segments) {
    if (seg.bold || seg.highlight) {
      tokens.push({ text: seg.text, bold: seg.bold, color: seg.color, highlight: seg.highlight });
    } else {
      const words = seg.text.split(/(\s+)/);
      for (const w of words) {
        if (w.length > 0) {
          tokens.push({ text: w, color: seg.color });
        }
      }
    }
  }

  const lines: Token[][] = [];
  let currentLineTokens: Token[] = [];
  let currentLineWidth = 0;

  for (const token of tokens) {
    ctx.font = token.bold ? `bold ${baseFontSize}px Arial` : `${baseFontSize}px Arial`;
    const tokenWidth = ctx.measureText(token.text).width;

    if (currentLineTokens.length === 0 && /^\s+$/.test(token.text)) {
      continue;
    }

    if (currentLineWidth + tokenWidth > maxWidth && currentLineTokens.length > 0) {
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

  if (currentLineTokens.length > 0) {
    while (currentLineTokens.length > 0 && /^\s+$/.test(currentLineTokens[currentLineTokens.length - 1].text)) {
      currentLineTokens.pop();
    }
    if (currentLineTokens.length > 0) {
      lines.push(currentLineTokens);
    }
  }

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
 * Draws the Loan Approval Letter body with rich formatting.
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

  // Title
  ctx.save();
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const titleWidth = ctx.measureText(rendered.headline).width;
  const titleX = leftX + Math.max(0, (contentWidth - titleWidth) / 2);
  const clampedTitleX = Math.max(leftX, titleX);
  ctx.fillText(rendered.headline, clampedTitleX, currentY, contentWidth);
  ctx.restore();
  currentY += 30;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const lines = rendered.body.split('\n');

  for (const line of lines) {
    if (line.trim() === '') {
      currentY += lineHeight * 0.4;
      continue;
    }

    if (line.startsWith('Application Number:')) {
      const label = 'Application Number:';
      const value = line.slice(label.length);
      currentY = drawLabelHighlightLine(ctx, label, value, leftX, currentY, baseFontSize, lineHeight, '#111111', '#fef08a', '#b45309');
      continue;
    }

    if (line.startsWith('Loan Number:')) {
      const label = 'Loan Number:';
      const value = line.slice(label.length);
      currentY = drawLabelHighlightLine(ctx, label, value, leftX, currentY, baseFontSize, lineHeight, '#111111', '#fef08a', '#b45309');
      continue;
    }

    if (line.startsWith('Subject:')) {
      currentY = drawWrappedText(ctx, line, leftX, currentY, contentWidth, lineHeight, `bold ${baseFontSize}px Arial`, '#111111');
      continue;
    }

    if (line.trim() === 'Processing & Verification' || line.trim() === 'Bank Account Details' ||
        line.trim() === 'Sanction Details' || line.trim() === 'Financial Summary' ||
        line.trim() === 'Disbursement Details' || line.trim() === 'Repayment Schedule' ||
        line.trim() === 'Terms & Conditions' || line.trim() === 'Applicant Details' ||
        line.trim() === 'Important Information') {
      currentY += 4;
      ctx.save();
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#1d4ed8';
      ctx.textBaseline = 'top';
      ctx.fillText(line, leftX, currentY);
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

    if (line.startsWith(':The processing charge is fully refundable')) {
      const noticeText = line.slice(1).trim();
      const boxPad = 6;
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
      ctx.fillStyle = '#d1fae5';
      ctx.fillRect(leftX, currentY - boxPad, contentWidth, boxHeight);
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 1;
      ctx.strokeRect(leftX, currentY - boxPad, contentWidth, boxHeight);
      ctx.restore();
      currentY = drawWrappedText(ctx, noticeText, leftX + boxPad, currentY, contentWidth - boxPad * 2, lineHeight, `bold ${baseFontSize}px Arial`, '#065f46');
      currentY += boxPad;
      continue;
    }

    if (line.startsWith('Bank Account Number:') || line.startsWith('IFSC Code:') || line.startsWith('UPI ID:') || line.startsWith('UPI Reference:')) {
      const colonIdx = line.indexOf(':');
      const label = line.slice(0, colonIdx + 1);
      const value = line.slice(colonIdx + 1);
      currentY = drawLabelHighlightLine(ctx, label, value, leftX, currentY, baseFontSize, lineHeight, '#111111', '#fef08a', '#b45309');
      continue;
    }

    if (line.startsWith('•')) {
      const bulletText = line.slice(1).trim();
      ctx.save();
      ctx.font = `bold ${baseFontSize}px Arial`;
      ctx.fillStyle = '#1d4ed8';
      ctx.textBaseline = 'top';
      ctx.fillText('•', leftX, currentY);
      ctx.restore();
      const bulletIndent = leftX + 14;
      currentY = drawWrappedText(ctx, bulletText, bulletIndent, currentY, contentWidth - 14, lineHeight, `${baseFontSize}px Arial`, '#333333');
      continue;
    }

    if (line.includes('₹') || line.includes('%')) {
      const segments = parseFinancialLine(line);
      const totalWidth = measureSegments(ctx, segments, baseFontSize);
      if (totalWidth <= contentWidth) {
        ctx.save();
        ctx.textBaseline = 'top';
        drawSegments(ctx, segments, leftX, currentY, baseFontSize);
        ctx.restore();
        currentY += lineHeight;
      } else {
        currentY = drawWrappedSegments(ctx, segments, leftX, currentY, contentWidth, lineHeight, baseFontSize);
      }
      continue;
    }

    currentY = drawWrappedText(ctx, line, leftX, currentY, contentWidth, lineHeight, `${baseFontSize}px Arial`, '#333333');
  }

  return currentY;
}

/**
 * Generic content renderer for non-Approval-Letter templates.
 */
function drawContent(
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

  // Title
  ctx.save();
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const titleWidth = ctx.measureText(rendered.headline).width;
  const titleX = leftX + Math.max(0, (contentWidth - titleWidth) / 2);
  ctx.fillText(rendered.headline, Math.max(leftX, titleX), currentY, contentWidth);
  ctx.restore();
  currentY += 28;

  const lines = rendered.body.split('\n');

  for (const line of lines) {
    if (line.trim() === '') {
      currentY += lineHeight * 0.4;
      continue;
    }

    // Section headings (all caps or known headings)
    if (
      (line.trim() === line.trim().toUpperCase() && line.trim().length > 3 && !/[₹%\d]/.test(line.trim())) ||
      line.trim() === 'Sanction Details' || line.trim() === 'Financial Summary' ||
      line.trim() === 'Disbursement Details' || line.trim() === 'Repayment Schedule' ||
      line.trim() === 'Terms & Conditions' || line.trim() === 'Applicant Details' ||
      line.trim() === 'Important Information' || line.trim() === 'Bank Account Details'
    ) {
      currentY += 4;
      ctx.save();
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#1d4ed8';
      ctx.textBaseline = 'top';
      ctx.fillText(line, leftX, currentY);
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

    if (line.startsWith('•') || line.startsWith('-')) {
      const bulletText = line.slice(1).trim();
      ctx.save();
      ctx.font = `bold ${baseFontSize}px Arial`;
      ctx.fillStyle = '#1d4ed8';
      ctx.textBaseline = 'top';
      ctx.fillText('•', leftX, currentY);
      ctx.restore();
      currentY = drawWrappedText(ctx, bulletText, leftX + 14, currentY, contentWidth - 14, lineHeight, `${baseFontSize}px Arial`, '#333333');
      continue;
    }

    if (line.includes('₹') || line.includes('%')) {
      const segments = parseFinancialLine(line);
      const totalWidth = measureSegments(ctx, segments, baseFontSize);
      if (totalWidth <= contentWidth) {
        ctx.save();
        ctx.textBaseline = 'top';
        drawSegments(ctx, segments, leftX, currentY, baseFontSize);
        ctx.restore();
        currentY += lineHeight;
      } else {
        currentY = drawWrappedSegments(ctx, segments, leftX, currentY, contentWidth, lineHeight, baseFontSize);
      }
      continue;
    }

    // Label:value lines
    if (line.includes(':') && !line.startsWith('•') && !line.startsWith('-')) {
      const colonIdx = line.indexOf(':');
      const label = line.slice(0, colonIdx + 1);
      const value = line.slice(colonIdx + 1);
      if (value.trim().length > 0 && label.length < 40) {
        currentY = drawLabelHighlightLine(ctx, label, value, leftX, currentY, baseFontSize, lineHeight, '#111111', '#fef08a', '#b45309');
        continue;
      }
    }

    currentY = drawWrappedText(ctx, line, leftX, currentY, contentWidth, lineHeight, `${baseFontSize}px Arial`, '#333333');
  }

  return currentY;
}

/**
 * Main export: renders a complete document to a canvas element.
 * Accepts the original (template, formData, documentType) signature.
 */
export async function renderDocumentToCanvas(
  canvas: HTMLCanvasElement,
  template: Template,
  formData: FormData,
  documentType: string
): Promise<void> {
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // Background image (if enabled)
  if (template.background?.enabled && template.background.dataUrl) {
    await drawBackgroundImage(ctx, {
      dataUrl: template.background.dataUrl,
      opacity: template.background.opacity,
      fit: template.background.fit,
    });
  }

  // Watermark (behind content)
  await renderWatermark(ctx, template);

  // Header
  const headerBottom = await renderHeader(ctx);

  // Footer
  await renderFooter(ctx);

  // Render content
  const rendered = renderTemplate(template, formData);
  const contentStartY = headerBottom + 10;

  if (documentType === 'Loan Approval Letter') {
    drawLoanApprovalContent(ctx, rendered, contentStartY);
  } else {
    drawContent(ctx, rendered, contentStartY);
  }
}
