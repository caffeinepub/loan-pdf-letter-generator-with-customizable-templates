import { Template } from '../../types/templates';
import { getPositionStyle } from '../../lib/templateAssets/positions';

interface TemplateOverlayProps {
  template: Template;
}

export default function TemplateOverlay({ template }: TemplateOverlayProps) {
  return (
    <>
      {/* Background Image */}
      {template.background?.enabled && template.background?.dataUrl && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${template.background.dataUrl})`,
            opacity: template.background.opacity,
            backgroundSize: template.background.fit,
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
      )}

      {/* Watermark image (if configured) */}
      {template.watermark?.enabled && template.watermark?.watermarkImageUrl && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
          style={{ zIndex: 1 }}
        >
          <img
            src={template.watermark.watermarkImageUrl}
            alt=""
            style={{
              width: '50%',
              opacity: template.watermark.opacity,
              userSelect: 'none',
            }}
          />
        </div>
      )}

      {/* Text Watermark (only if no image watermark) */}
      {template.watermark?.enabled && template.watermark?.text && !template.watermark?.watermarkImageUrl && (
        <div
          className="pointer-events-none absolute select-none whitespace-nowrap font-bold"
          style={{
            ...getPositionStyle(template.watermark.position),
            fontSize: `${template.watermark.size}px`,
            opacity: template.watermark.opacity,
            transform: `${getPositionStyle(template.watermark.position).transform || ''} rotate(${template.watermark.rotation}deg)`,
            color: template.watermark.color ?? 'rgba(0, 0, 0, 0.3)',
            zIndex: 1,
          }}
        >
          {template.watermark.text}
        </div>
      )}

      {/* Seal */}
      {template.seal?.enabled && template.seal?.dataUrl && (
        <div
          className="absolute"
          style={{
            ...getPositionStyle(template.seal.position),
            width: `${template.seal.size}px`,
            height: `${template.seal.size}px`,
            opacity: (template.seal.opacity ?? 80) / 100,
            zIndex: 10,
          }}
        >
          <img
            src={template.seal.dataUrl}
            alt="Seal"
            className="h-full w-full object-contain"
          />
        </div>
      )}

      {/* Signature */}
      {template.signature?.enabled && template.signature?.dataUrl && (
        <div
          className="absolute"
          style={{
            ...getPositionStyle(template.signature.position),
            width: `${template.signature.size}px`,
            height: `${template.signature.size}px`,
            opacity: (template.signature.opacity ?? 100) / 100,
            zIndex: 10,
          }}
        >
          <img
            src={template.signature.dataUrl}
            alt="Signature"
            className="h-full w-full object-contain"
          />
        </div>
      )}
    </>
  );
}
