// A4 page dimensions at 96 DPI
export const PAGE_WIDTH = 794; // 210mm
export const PAGE_HEIGHT = 1123; // 297mm

export const MARGINS = {
  top: 60,
  bottom: 60,
  left: 60,
  right: 60,
};

export const HEADER_HEIGHT = 80;
export const FOOTER_HEIGHT = 60;

export const CONTENT_AREA = {
  x: MARGINS.left,
  y: MARGINS.top + HEADER_HEIGHT,
  width: PAGE_WIDTH - MARGINS.left - MARGINS.right,
  height: PAGE_HEIGHT - MARGINS.top - MARGINS.bottom - HEADER_HEIGHT - FOOTER_HEIGHT,
};
