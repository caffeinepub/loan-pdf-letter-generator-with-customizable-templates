import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Template, FormData } from '../types/templates';
import { renderTemplate } from '../lib/templates/renderTemplate';
import TemplateOverlay from './preview/TemplateOverlay';

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template;
  formData: FormData;
  documentType: string;
}

export default function PreviewDialog({
  open,
  onOpenChange,
  template,
  formData,
  documentType,
}: PreviewDialogProps) {
  const rendered = renderTemplate(template, formData);

  const hasBusinessName = !!(template.businessName && template.businessName.trim().length > 0);
  const hasBusinessAddress = !!(template.businessAddress && template.businessAddress.trim().length > 0);
  const hasLogo = !!template.logoDataUrl;
  const showHeader = hasBusinessName || hasBusinessAddress || hasLogo;

  const hasSignature = !!(template.signature?.dataUrl);
  const hasSeal = !!(template.seal?.dataUrl);
  const showSignatureRow = hasSignature || hasSeal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Preview: {documentType}</DialogTitle>
          <DialogDescription>
            This is how your document will appear with the current form data
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[600px] rounded-lg border border-border bg-white">
          <div className="relative">
            {/* Overlay elements (background, watermark, seal, signature) */}
            <TemplateOverlay template={template} />

            {/* Two-column Header — applied to ALL templates */}
            {showHeader && (
              <div
                className="relative flex items-center justify-between px-8 py-5 border-b border-gray-200"
                style={{ zIndex: 2 }}
              >
                {/* Left: Business Name + Address */}
                <div className="flex flex-col justify-center min-w-0 flex-1 pr-4">
                  {hasBusinessName && (
                    <div className="text-base font-bold text-gray-900 leading-tight">
                      {template.businessName}
                    </div>
                  )}
                  {hasBusinessAddress && (
                    <div className="text-xs text-gray-500 mt-0.5 whitespace-pre-line leading-snug">
                      {template.businessAddress}
                    </div>
                  )}
                </div>

                {/* Right: Logo */}
                {hasLogo && (
                  <div className="flex-shrink-0 flex items-center justify-end">
                    <img
                      src={template.logoDataUrl!}
                      alt="Company Logo"
                      className="h-14 max-w-[140px] object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Main Content */}
            <div className="relative p-8" style={{ zIndex: 2 }}>
              {/* Headline */}
              <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
                {rendered.headline}
              </h1>

              {/* Body */}
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {rendered.body}
              </div>
            </div>

            {/* Signature & Stamp — two-column row after body text */}
            {showSignatureRow && (
              <div
                className="relative px-8 pb-6"
                style={{ zIndex: 2 }}
              >
                <div className="flex items-end justify-between gap-8 mt-4">
                  {/* Left column: Signature */}
                  <div className="flex-1 flex flex-col items-center">
                    {hasSignature ? (
                      <>
                        <img
                          src={template.signature!.dataUrl!}
                          alt="Signature"
                          className="max-h-16 max-w-[160px] object-contain mb-2"
                        />
                        <div className="w-full border-t border-gray-300 pt-1 text-center text-xs text-gray-500">
                          Authorized Signature
                        </div>
                      </>
                    ) : (
                      <div className="h-16" />
                    )}
                  </div>

                  {/* Right column: Stamp / Seal */}
                  <div className="flex-1 flex flex-col items-center">
                    {hasSeal ? (
                      <>
                        <img
                          src={template.seal!.dataUrl!}
                          alt="Stamp"
                          className="max-h-16 max-w-[160px] object-contain mb-2"
                        />
                        <div className="w-full border-t border-gray-300 pt-1 text-center text-xs text-gray-500">
                          Official Stamp
                        </div>
                      </>
                    ) : (
                      <div className="h-16" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            {template.footerText && template.footerText.trim() && (
              <div
                className="relative border-t border-border p-4 text-center text-xs text-muted-foreground"
                style={{ zIndex: 2 }}
              >
                {template.footerText}
              </div>
            )}

            {/* Generation Date */}
            <div
              className="relative p-4 text-center text-xs italic text-muted-foreground"
              style={{ zIndex: 2 }}
            >
              Generated on {new Date().toLocaleDateString()}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
