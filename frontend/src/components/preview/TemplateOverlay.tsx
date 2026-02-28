import React from 'react';
import { Template } from '../../types/templates';
import { positionPresetToStyle } from '../../lib/templateAssets/positions';

interface TemplateOverlayProps {
  template: Template;
  containerWidth: number;
  containerHeight: number;
}

export default function TemplateOverlay({
  template,
  containerWidth,
  containerHeight,
}: TemplateOverlayProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ width: containerWidth, height: containerHeight }}
    >
      {/* Background image */}
      {template.backgroundDataUrl && (
        <img
          src={template.backgroundDataUrl}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
      )}

      {/* Watermark */}
      {template.showWatermark && template.watermarkText && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: template.watermarkOpacity || 0.08 }}
        >
          <span
            className="text-gray-500 font-bold select-none"
            style={{
              fontSize: `${Math.min(containerWidth / 6, 80)}px`,
              transform: 'rotate(-30deg)',
              whiteSpace: 'nowrap',
            }}
          >
            {template.watermarkText}
          </span>
        </div>
      )}

      {/* Seal */}
      {template.seal?.enabled && template.seal.dataUrl && (
        <img
          src={template.seal.dataUrl}
          alt="seal"
          className="absolute"
          style={{
            width: template.seal.size || 80,
            height: template.seal.size || 80,
            ...positionPresetToStyle(template.seal.position || 'bottom-right'),
          }}
        />
      )}

      {/* Signature */}
      {template.signature?.enabled && template.signature.dataUrl && (
        <img
          src={template.signature.dataUrl}
          alt="signature"
          className="absolute"
          style={{
            height: 40,
            width: 'auto',
            bottom: '8px',
            left: '8px',
          }}
        />
      )}
    </div>
  );
}
