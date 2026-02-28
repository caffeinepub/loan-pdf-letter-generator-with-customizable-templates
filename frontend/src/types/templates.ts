export type PositionPreset = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
export type SignatureLayout = 'stacked' | 'sideBySide';
export type FooterLayout = 'centered' | 'twoColumn';

export interface OverlayAsset {
  dataUrl: string;
  size: number;
  position: PositionPreset;
  rotation: number;
  fit: 'contain' | 'cover' | 'fill';
  enabled: boolean;
}

export interface SignatureAsset {
  dataUrl: string;
  enabled: boolean;
  signatoryName?: string;
  signatoryTitle?: string;
}

export interface Template {
  id: string;
  name: string;
  documentType: string;
  headline: string;
  body: string;

  // Business info
  businessName: string;
  businessAddress: string;

  // Logo
  logoDataUrl?: string;

  // Watermark
  watermarkText: string;
  watermarkOpacity: number;
  showWatermark: boolean;

  // Seal / stamp
  seal?: OverlayAsset;

  // Signature
  signature?: SignatureAsset;

  // Background
  backgroundDataUrl?: string;

  // Footer
  footerText: string;
  footerLayout: FooterLayout;

  // Header
  headerColor: string;

  // QR
  showQrCode: boolean;
  qrPayload: string;

  // Layout
  signatureLayout: SignatureLayout;

  // Optional custom field
  optionalCustomFieldLabel?: string;
  optionalCustomFieldValue?: string;

  // Color
  color?: string;
}
