import { FormData, DocumentType } from './form';

export type { FormData, DocumentType };

export type PositionPreset = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export type LogoSize = 'small' | 'medium' | 'large' | 'extraLarge';

export interface BackgroundSettings {
  enabled?: boolean;
  dataUrl: string | null;
  opacity: number;
  fit: 'cover' | 'contain' | 'fill';
}

export interface WatermarkSettings {
  enabled?: boolean;
  text: string;
  opacity: number;
  size: number;
  rotation: number;
  position: PositionPreset;
  color?: string;
  /** Optional URL/path to a background watermark image rendered behind text */
  watermarkImageUrl?: string;
}

export interface ImageElementSettings {
  enabled?: boolean;
  dataUrl: string | null;
  size: number;
  position: PositionPreset;
  opacity?: number;
  signatoryName?: string;
  signatoryTitle?: string;
}

export interface Template {
  /** Unique identifier — built-in templates use the DocumentType string, custom templates use a generated id */
  id?: string;
  /** Display name for custom templates */
  name?: string;
  headline: string;
  body: string;
  logoDataUrl: string | null;
  headerColor?: string;
  businessName: string;
  businessAddress: string;
  watermarkText: string;
  footerText: string;
  logoSize?: LogoSize;
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
