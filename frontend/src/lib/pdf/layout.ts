// A4 dimensions at 96 DPI
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

export const MARGIN_LEFT = 48;
export const MARGIN_RIGHT = 48;
export const MARGIN_TOP = 24;
export const MARGIN_BOTTOM = 24;

export const HEADER_HEIGHT = 110;
export const FOOTER_HEIGHT = 160;

export const CONTENT_WIDTH = A4_WIDTH_PX - MARGIN_LEFT - MARGIN_RIGHT;
export const CONTENT_START_Y = MARGIN_TOP + HEADER_HEIGHT + 16;
export const CONTENT_END_Y = A4_HEIGHT_PX - MARGIN_BOTTOM - FOOTER_HEIGHT;
export const CONTENT_HEIGHT = CONTENT_END_Y - CONTENT_START_Y;
