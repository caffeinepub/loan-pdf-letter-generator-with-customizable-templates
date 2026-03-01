// A4 page dimensions at 96 DPI
export const PAGE_WIDTH = 794; // 210mm
export const PAGE_HEIGHT = 1123; // 297mm

export const MARGINS = {
  top: 0,
  bottom: 60,
  left: 60,
  right: 60,
};

// Header height is calculated from the Bajaj header image aspect ratio:
// The uploaded image is approximately 1050×280px → ratio ≈ 0.267
// At PAGE_WIDTH=794: height ≈ 794 * (280/1050) ≈ 212px
export const HEADER_HEIGHT = 212;
export const FOOTER_HEIGHT = 60;

export const CONTENT_AREA = {
  x: MARGINS.left,
  y: HEADER_HEIGHT,
  width: PAGE_WIDTH - MARGINS.left - MARGINS.right,
  height: PAGE_HEIGHT - MARGINS.bottom - HEADER_HEIGHT - FOOTER_HEIGHT,
};
