import React from 'react';
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

// ── Header image path ─────────────────────────────────────────────────────────
const BAJAJ_HEADER_IMAGE =
  '/assets/Corporate Office, Off Pune-Ahmednagar Road, Viman Nagar, Pune - 411014 Baja_20260228_134953_0000-2.png';

// ── Footer image path ─────────────────────────────────────────────────────────
const BAJAJ_FOOTER_IMAGE =
  '/assets/Corporate Office, Off Pune-Ahmednagar Road, Viman Nagar, Pune - 411014 Baja_20260228_134953_0001-1.png';

// ── Bajaj Finance watermark image (FB logo) ───────────────────────────────────
const BAJAJ_WATERMARK_IMAGE = '/assets/images (15).jpeg';

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template;
  formData: FormData;
  documentType: string;
}

/**
 * Highlight style for placeholder values — yellow background + bold.
 */
const HIGHLIGHT_STYLE: React.CSSProperties = {
  backgroundColor: '#fef08a',
  fontWeight: 'bold',
  color: '#78350f',
  padding: '0 3px',
  borderRadius: '2px',
  border: '1px solid #fde047',
};

/**
 * Splits a text line on ₹ amounts and % values, rendering them with highlight + bold.
 */
function renderFinancialLine(line: string): React.ReactNode {
  const parts = line.split(/(₹[\d,]+(?:\.\d+)?|\d+(?:\.\d+)?%)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^₹[\d,]+/.test(part)) {
          return (
            <mark key={i} style={HIGHLIGHT_STYLE}>
              {part}
            </mark>
          );
        }
        if (/^\d+(?:\.\d+)?%$/.test(part)) {
          return (
            <mark key={i} style={{ ...HIGHLIGHT_STYLE, color: '#1e3a8a' }}>
              {part}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/**
 * Renders a label:value line where the value gets bold + yellow highlight.
 */
function renderLabelValueLine(
  idx: number,
  label: string,
  value: string,
  labelColor?: string
): React.ReactNode {
  return (
    <div key={idx} style={{ marginBottom: '2px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      <strong style={labelColor ? { color: labelColor } : undefined}>{label}</strong>
      <mark style={HIGHLIGHT_STYLE}>{value}</mark>
    </div>
  );
}

/**
 * Renders the body text of the Loan Approval Letter with bold and highlighted
 * formatting for key financial values, bank details, and the refundable notice.
 */
function renderLoanApprovalBody(body: string): React.ReactNode {
  const lines = body.split('\n');

  return (
    <div
      style={{
        fontSize: '11px',
        color: '#222222',
        lineHeight: 1.8,
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {lines.map((line, idx) => {
        // ── Application Number line ───────────────────────────────────────────
        if (line.startsWith('Application Number:')) {
          const value = line.slice('Application Number:'.length);
          return (
            <div key={idx} style={{ marginBottom: '2px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              <strong>Application Number:</strong>
              <mark style={{ ...HIGHLIGHT_STYLE, color: '#b45309' }}>{value}</mark>
            </div>
          );
        }

        // ── Loan Number line ──────────────────────────────────────────────────
        if (line.startsWith('Loan Number:')) {
          const value = line.slice('Loan Number:'.length);
          return (
            <div key={idx} style={{ marginBottom: '2px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              <strong>Loan Number:</strong>
              <mark style={{ ...HIGHLIGHT_STYLE, color: '#b45309' }}>{value}</mark>
            </div>
          );
        }

        // ── Subject line ──────────────────────────────────────────────────────
        if (line.startsWith('Subject:')) {
          return (
            <div
              key={idx}
              style={{
                fontWeight: 'bold',
                color: '#111111',
                marginBottom: '8px',
                marginTop: '4px',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {line}
            </div>
          );
        }

        // ── "Processing & Verification" section heading ───────────────────────
        if (line.trim() === 'Processing & Verification') {
          return (
            <div
              key={idx}
              style={{
                fontWeight: 'bold',
                fontSize: '12px',
                color: '#1d4ed8',
                marginTop: '12px',
                marginBottom: '4px',
                borderBottom: '1px solid #bfdbfe',
                paddingBottom: '2px',
              }}
            >
              {line}
            </div>
          );
        }

        // ── "Bank Account Details" section heading ────────────────────────────
        if (line.trim() === 'Bank Account Details') {
          return (
            <div
              key={idx}
              style={{
                fontWeight: 'bold',
                fontSize: '12px',
                color: '#1d4ed8',
                marginTop: '12px',
                marginBottom: '4px',
                borderBottom: '1px solid #bfdbfe',
                paddingBottom: '2px',
              }}
            >
              {line}
            </div>
          );
        }

        // ── Refundable notice line (starts with colon) ────────────────────────
        if (line.startsWith(':The processing charge is fully refundable')) {
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#d1fae5',
                border: '1px solid #6ee7b7',
                borderRadius: '4px',
                padding: '6px 10px',
                marginTop: '6px',
                marginBottom: '6px',
                fontWeight: 'bold',
                color: '#065f46',
                fontSize: '11px',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {line.slice(1).trim()}
            </div>
          );
        }

        // ── Bank Account Number line ──────────────────────────────────────────
        if (line.startsWith('Bank Account Number:')) {
          const value = line.slice('Bank Account Number:'.length);
          return renderLabelValueLine(idx, 'Bank Account Number:', value);
        }

        // ── IFSC Code line ────────────────────────────────────────────────────
        if (line.startsWith('IFSC Code:')) {
          const value = line.slice('IFSC Code:'.length);
          return renderLabelValueLine(idx, 'IFSC Code:', value);
        }

        // ── UPI ID line ───────────────────────────────────────────────────────
        if (line.startsWith('UPI ID:')) {
          const value = line.slice('UPI ID:'.length);
          return renderLabelValueLine(idx, 'UPI ID:', value);
        }

        // ── Bullet point lines ────────────────────────────────────────────────
        if (line.startsWith('•')) {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '3px',
                paddingLeft: '8px',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              <span style={{ color: '#1d4ed8', fontWeight: 'bold', flexShrink: 0 }}>•</span>
              <span style={{ flex: 1, minWidth: 0 }}>{line.slice(1).trim()}</span>
            </div>
          );
        }

        // ── Lines with ₹ amounts or % values ─────────────────────────────────
        if (line.includes('₹') || line.includes('%')) {
          return (
            <div
              key={idx}
              style={{
                marginTop: '4px',
                marginBottom: '2px',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {renderFinancialLine(line)}
            </div>
          );
        }

        // ── "Dear {{name}}" line — highlight the name ─────────────────────────
        if (line.startsWith('Dear ') && line.endsWith(',')) {
          const name = line.slice(5, -1);
          return (
            <div key={idx} style={{ marginTop: '8px', marginBottom: '4px' }}>
              Dear <mark style={HIGHLIGHT_STYLE}>{name}</mark>,
            </div>
          );
        }

        // ── Empty lines → spacer ──────────────────────────────────────────────
        if (line.trim() === '') {
          return <div key={idx} style={{ height: '6px' }} />;
        }

        // ── Default line ──────────────────────────────────────────────────────
        return (
          <div key={idx} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {line}
          </div>
        );
      })}
    </div>
  );
}

export default function PreviewDialog({
  open,
  onOpenChange,
  template,
  formData,
  documentType,
}: PreviewDialogProps) {
  const rendered = renderTemplate(template, formData);

  const hasSignature = !!(template.signature?.enabled && template.signature?.dataUrl);
  const hasSeal = !!(template.seal?.enabled && template.seal?.dataUrl);
  const showSignatureRow = hasSignature || hasSeal;

  const isLoanApprovalLetter = documentType === 'Loan Approval Letter';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>Preview: {documentType}</DialogTitle>
          <DialogDescription>
            This is how your document will appear with the current form data
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[600px] rounded-lg border border-border bg-white">
          <div
            className="relative"
            style={{
              fontFamily: 'Arial, sans-serif',
              width: '100%',
              boxSizing: 'border-box',
              overflowX: 'hidden',
            }}
          >
            {/* Overlay elements (background, watermark text, seal, signature) */}
            <TemplateOverlay template={template} />

            {/* ── BAJAJ FINANCE FB LOGO WATERMARK — only for Loan Approval Letter ── */}
            {isLoanApprovalLetter && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              >
                <img
                  src={BAJAJ_WATERMARK_IMAGE}
                  alt=""
                  style={{
                    width: '40%',
                    opacity: 0.15,
                    userSelect: 'none',
                  }}
                />
              </div>
            )}

            {/* ── BAJAJ FINANCE LIMITED HEADER IMAGE — zero margin/padding ── */}
            <img
              src={BAJAJ_HEADER_IMAGE}
              alt="Bajaj Finance Limited Header"
              style={{
                display: 'block',
                width: '100%',
                margin: 0,
                padding: 0,
                border: 'none',
                position: 'relative',
                zIndex: 2,
              }}
            />

            {/* ── DOCUMENT CONTENT ── */}
            <div
              style={{
                padding: '20px 40px',
                zIndex: 2,
                position: 'relative',
                boxSizing: 'border-box',
                width: '100%',
                overflowX: 'hidden',
              }}
            >
              {/* Document Title */}
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#111111',
                  textAlign: 'center',
                  marginBottom: '20px',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
                {rendered.headline}
              </h2>

              {/* Document Body — rich HTML for Loan Approval Letter, plain for others */}
              {isLoanApprovalLetter ? (
                renderLoanApprovalBody(rendered.body)
              ) : (
                <div
                  style={{
                    fontSize: '11px',
                    color: '#222222',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {rendered.body}
                </div>
              )}

              {/* Signature / Stamp Row */}
              {showSignatureRow && (
                <div
                  style={{
                    display: 'flex',
                    gap: '40px',
                    marginTop: '40px',
                    alignItems: 'flex-end',
                  }}
                >
                  {hasSignature && template.signature?.dataUrl && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <img
                        src={template.signature.dataUrl}
                        alt="Signature"
                        style={{
                          maxHeight: '70px',
                          maxWidth: '160px',
                          objectFit: 'contain',
                          opacity: (template.signature.opacity ?? 100) / 100,
                        }}
                      />
                      <span style={{ fontSize: '10px', color: '#555555', marginTop: '4px' }}>
                        {template.signature.signatoryName || 'Authorized Signature'}
                      </span>
                    </div>
                  )}
                  {hasSeal && template.seal?.dataUrl && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <img
                        src={template.seal.dataUrl}
                        alt="Official Stamp"
                        style={{
                          maxHeight: '70px',
                          maxWidth: '100px',
                          objectFit: 'contain',
                          opacity: (template.seal.opacity ?? 80) / 100,
                        }}
                      />
                      <span style={{ fontSize: '10px', color: '#555555', marginTop: '4px' }}>
                        Official Stamp
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── BAJAJ FINANCE LIMITED FOOTER IMAGE ── */}
            <img
              src={BAJAJ_FOOTER_IMAGE}
              alt="Bajaj Finance Limited Footer"
              style={{
                display: 'block',
                width: '100%',
                margin: 0,
                padding: 0,
                border: 'none',
                position: 'relative',
                zIndex: 2,
              }}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
