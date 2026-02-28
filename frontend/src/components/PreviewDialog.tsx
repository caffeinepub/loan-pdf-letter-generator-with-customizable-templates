import React, { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Template } from '../types/templates';
import { FormData } from '../types/form';
import { renderDocumentToCanvas } from '../lib/pdf/renderDocumentToCanvas';
import { generatePdf } from '../lib/pdf/generatePdf';
import { downloadBlob } from '../lib/download';
import { sharePdf } from '../lib/shareUtils';
import { Download, Share2, Loader2, X } from 'lucide-react';

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  template: Template;
  formData: FormData;
}

export default function PreviewDialog({
  open,
  onClose,
  template,
  formData,
}: PreviewDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setIsRendering(true);
    setPreviewDataUrl(null);

    renderDocumentToCanvas(template, formData)
      .then((canvas) => {
        setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.85));
      })
      .catch(console.error)
      .finally(() => setIsRendering(false));
  }, [open, template, formData]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const pdf = await generatePdf(template, formData);
      downloadBlob(pdf, `loan-document-${formData.name || 'document'}.pdf`);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const pdf = await generatePdf(template, formData);
      const shared = await sharePdf(pdf, `loan-document-${formData.name || 'document'}.pdf`);
      if (!shared) {
        // Fallback to download
        downloadBlob(pdf, `loan-document-${formData.name || 'document'}.pdf`);
      }
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-xl">Document Preview</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 bg-muted/30">
          {isRendering ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Rendering document...</span>
            </div>
          ) : previewDataUrl ? (
            <div className="flex justify-center">
              <img
                src={previewDataUrl}
                alt="Document Preview"
                className="max-w-full shadow-lg border border-border"
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Failed to render preview
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0 gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={isRendering || isSharing || isDownloading}
          >
            {isSharing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            Share
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isRendering || isDownloading || isSharing}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
