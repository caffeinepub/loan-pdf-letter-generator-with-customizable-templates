import React, { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Template } from '../types/templates';
import { FormData } from '../types/form';
import { renderTemplate } from '../lib/templates/renderTemplate';
import TemplateOverlay from './preview/TemplateOverlay';

// ── Hardcoded Bajaj Finserv branding ──────────────────────────────────────────
const BAJAJ_COMPANY_NAME = 'Bajaj Finserv Limited';
const BAJAJ_ADDRESS_LINES = [
  'Regd. Office',
  'Bajaj Auto Limited Complex',
  'Mumbai - Pune Road,',
  'Pune - 411035 MH (IN)',
  'Email ID: investors@bajajfinserv.in',
  'Corporate Identity Number (CIN)',
  'L65910MH1987PLC042961',
  'IRDAI Corporate Agency (Composite)',
];
// Use the exact uploaded Bajaj Finserv logo — no modifications
const BAJAJ_LOGO_PATH = '/assets/bajaj_finserv-logo_brandlogos.net_z2tuf-2.png';
const FOOTER_TEXT =
  'This document is system generated. For queries, contact investors@bajajfinserv.in';

// Footer partner/brand images — first image replaced with Dhani Finance LTD. signature block
const FOOTER_IMAGES = [
  '/assets/20260228_092922_0002.png',
  '/assets/generated/footer-img-2.dim_200x80.png',
  '/assets/generated/footer-img-3.dim_200x80.png',
  '/assets/generated/footer-img-4.dim_200x80.png',
];

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
  const leftContentRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number>(0);

  useEffect(() => {
    if (open && leftContentRef.current) {
      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        if (leftContentRef.current) {
          setLeftHeight(leftContentRef.current.offsetHeight);
        }
      });
    }
  }, [open]);

  const hasSignature = !!(template.signature?.enabled && template.signature?.dataUrl);
  const hasSeal = !!(template.seal?.enabled && template.seal?.dataUrl);
  const showSignatureRow = hasSignature || hasSeal;

  // Increase logo height by 40% compared to the left content block
  const logoHeight = leftHeight > 0 ? Math.round(leftHeight * 1.4) : 0;

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
          <div className="relative" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Overlay elements (background, watermark, seal, signature) */}
            <TemplateOverlay template={template} />

            {/* ── HARDCODED BAJAJ FINSERV HEADER ── */}
            <div
              className="relative"
              style={{ padding: '16px 32px 0 32px', zIndex: 2 }}
            >
              <div className="flex items-center justify-between">
                {/* Left: Company Details */}
                <div ref={leftContentRef} style={{ flex: 1, paddingRight: '16px' }}>
                  <p
                    style={{
                      fontWeight: 'bold',
                      fontSize: '13px',
                      color: '#1a1a1a',
                      marginBottom: '4px',
                      lineHeight: 1.3,
                    }}
                  >
                    {BAJAJ_COMPANY_NAME}
                  </p>
                  {BAJAJ_ADDRESS_LINES.map((line, idx) => (
                    <p
                      key={idx}
                      style={{
                        fontSize: '9px',
                        color: '#333333',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Right: Logo — increased size, no visual modifications */}
                <div
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <img
                    src={BAJAJ_LOGO_PATH}
                    alt="Bajaj Finserv"
                    style={{
                      height: logoHeight > 0 ? `${logoHeight}px` : 'auto',
                      maxWidth: '280px',
                      width: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    onLoad={() => {
                      if (leftContentRef.current) {
                        setLeftHeight(leftContentRef.current.offsetHeight);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Divider line */}
              <div
                style={{
                  borderBottom: '2px solid #1a56a0',
                  marginTop: '10px',
                }}
              />
            </div>

            {/* ── DOCUMENT CONTENT ── */}
            <div style={{ padding: '20px 32px', zIndex: 2, position: 'relative' }}>
              {/* Document Title */}
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#111111',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              >
                {rendered.headline}
              </h2>

              {/* Document Body */}
              <div
                style={{
                  fontSize: '11px',
                  color: '#222222',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {rendered.body}
              </div>

              {/* Signature / Stamp Row */}
              {showSignatureRow && (
                <div
                  style={{
                    display: 'flex',
                    gap: '40px',
                    marginTop: '40px',
                  }}
                >
                  {hasSignature && template.signature?.dataUrl && (
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <img
                        src={template.signature.dataUrl}
                        alt="Signature"
                        style={{
                          maxHeight: '70px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          opacity: (template.signature.opacity ?? 100) / 100,
                        }}
                      />
                      <div
                        style={{
                          borderTop: '1px solid #cccccc',
                          marginTop: '4px',
                          paddingTop: '4px',
                          fontSize: '10px',
                          color: '#666666',
                        }}
                      >
                        {template.signature.signatoryName || 'Authorized Signature'}
                      </div>
                    </div>
                  )}
                  {hasSeal && template.seal?.dataUrl && (
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <img
                        src={template.seal.dataUrl}
                        alt="Official Stamp"
                        style={{
                          maxHeight: '70px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          opacity: (template.seal.opacity ?? 80) / 100,
                        }}
                      />
                      <div
                        style={{
                          borderTop: '1px solid #cccccc',
                          marginTop: '4px',
                          paddingTop: '4px',
                          fontSize: '10px',
                          color: '#666666',
                        }}
                      >
                        Official Stamp
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── HARDCODED BAJAJ FINSERV FOOTER ── */}
            <div
              style={{
                padding: '0 32px 16px 32px',
                zIndex: 2,
                position: 'relative',
              }}
            >
              {/* Top divider */}
              <div style={{ borderTop: '2px solid #1a56a0', marginBottom: '10px' }} />

              {/* Footer images row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                {FOOTER_IMAGES.map((src, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={src}
                      alt={`Partner ${idx + 1}`}
                      style={{
                        maxHeight: '48px',
                        maxWidth: '100%',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom divider */}
              <div style={{ borderTop: '1px solid #cccccc', paddingTop: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '8px',
                    color: '#555555',
                  }}
                >
                  <span>{FOOTER_TEXT}</span>
                  <span>Generated: {new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
