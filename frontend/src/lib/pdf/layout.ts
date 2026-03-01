// A4 page dimensions at 96 DPI
export const PAGE_WIDTH = 794; // 210mm
export const PAGE_HEIGHT = 1123; // 297mm

export const MARGINS = {
  top: 0,
  bottom: 60,
  left: 60,
  right: 60,
};

// Header height is calculated from the uploaded Header.png aspect ratio:
// Header.png → approximately 1050x300 → ratio = 300/1050 ≈ 0.286
// At PAGE_WIDTH=794: height ≈ 794 * 0.286 ≈ 227px
export const HEADER_HEIGHT = 227;

// Footer height is calculated from the uploaded Footer.png aspect ratio:
// Footer.png → approximately 1050x200 → ratio = 200/1050 ≈ 0.190
// At PAGE_WIDTH=794: height ≈ 794 * 0.190 ≈ 151px
export const FOOTER_HEIGHT = 151;

export const CONTENT_AREA = {
  x: MARGINS.left,
  y: HEADER_HEIGHT,
  width: PAGE_WIDTH - MARGINS.left - MARGINS.right,
  height: PAGE_HEIGHT - MARGINS.bottom - HEADER_HEIGHT - FOOTER_HEIGHT,
};
