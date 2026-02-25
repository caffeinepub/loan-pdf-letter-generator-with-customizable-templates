import { FormData, DocumentType } from './form';

export type { FormData, DocumentType };

export type PositionPreset = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export interface BackgroundSettings {
  dataUrl: string | null;
  opacity: number;
  fit: 'cover' | 'contain' | 'fill';
}

export interface WatermarkSettings {
  text: string;
  opacity: number;
  size: number;
  rotation: number;
  position: PositionPreset;
}

export interface ImageElementSettings {
  dataUrl: string | null;
  size: number;
  position: PositionPreset;
}

export interface Template {
  headline: string;
  body: string;
  logoDataUrl: string | null;
  /** @deprecated Use businessName + businessAddress for header layout instead */
  headerColor?: string;
  businessName: string;
  businessAddress: string;
  watermarkText: string;
  footerText: string;
  // Advanced settings
  background?: BackgroundSettings;
  watermark?: WatermarkSettings;
  seal?: ImageElementSettings;
  signature?: ImageElementSettings;
}

export interface CustomTemplate extends Template {
  id: string;
  name: string;
}
