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

// ── Shared header/footer image paths ─────────────────────────────────────────
const BAJAJ_HEADER_IMAGE = '/assets/Header.png';
const BAJAJ_FOOTER_IMAGE = '/assets/Footer.png';

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
 * Renders a section heading with blue color and underline.
 */
function renderSectionHeading(idx: number, text: string): React.ReactNode {
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
      {text}
    </div>
  );
}

const SECTION_HEADINGS = new Set([
  'Processing & Verification',
  'Bank Account Details',
  'Sanction Details',
  'Financial Summary',
  'Disbursement Details',
  'Repayment Schedule',
  'Terms & Conditions',
  'Applicant Details',
  'Important Information',
]);

/**
 * Renders the body text with rich formatting for financial documents.
 */
function renderDocumentBody(body: string): React.ReactNode {
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

        // ── Loan Number / Sanction Reference / Reference Number ───────────────
        if (line.startsWith('Loan Number:') || line.startsWith('Sanction Reference:') || line.startsWith('Reference Number:')) {
          const colonIdx = line.indexOf(':');
          const label = line.slice(0, colonIdx + 1);
          const value = line.slice(colonIdx + 1);
          return (
            <div key={idx} style={{ marginBottom: '2px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              <strong>{label}</strong>
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

        // ── Section headings ──────────────────────────────────────────────────
        if (SECTION_HEADINGS.has(line.trim())) {
          return renderSectionHeading(idx, line);
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

        // ── Bank Account Number / IFSC / UPI lines ────────────────────────────
        if (
          line.startsWith('Bank Account Number:') ||
          line.startsWith('IFSC Code:') ||
          line.startsWith('UPI ID:') ||
          line.startsWith('UPI Reference:')
        ) {
          const colonIdx = line.indexOf(':');
          const label = line.slice(0, colonIdx + 1);
          const value = line.slice(colonIdx + 1);
          return renderLabelValueLine(idx, label, value, '#111111');
        }

        // ── Bullet points ─────────────────────────────────────────────────────
        if (line.startsWith('•') || line.startsWith('-')) {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '2px',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              <span style={{ color: '#1d4ed8', fontWeight: 'bold', flexShrink: 0 }}>•</span>
              <span>{line.slice(1).trim()}</span>
            </div>
          );
        }

        // ── Financial lines (₹ or %) ──────────────────────────────────────────
        if (line.includes('₹') || line.includes('%')) {
          return (
            <div key={idx} style={{ marginBottom: '2px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              {renderFinancialLine(line)}
            </div>
          );
        }

        // ── Label:value lines ─────────────────────────────────────────────────
        if (line.includes(':') && !line.startsWith('Dear') && !line.startsWith('This') && !line.startsWith('We ') && !line.startsWith('Please') && !line.startsWith('For ') && !line.startsWith('After') && !line.startsWith('Kindly') && !line.startsWith('If ') && !line.startsWith('Warm') && !line.startsWith('Best') && !line.startsWith('Authorized') && !line.startsWith('Credit') && !line.startsWith('Bajaj') && !line.startsWith('Corporate')) {
          const colonIdx = line.indexOf(':');
          const label = line.slice(0, colonIdx + 1);
          const value = line.slice(colonIdx + 1);
          if (value.trim().length > 0 && label.length < 40 && !label.includes(' ') || (label.split(' ').length <= 4 && value.trim().length > 0 && label.length < 40)) {
            return renderLabelValueLine(idx, label, value);
          }
        }

        // ── Empty lines ───────────────────────────────────────────────────────
        if (line.trim() === '') {
          return <div key={idx} style={{ height: '6px' }} />;
        }

        // ── Default paragraph ─────────────────────────────────────────────────
        return (
          <div key={idx} style={{ marginBottom: '2px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-2">
          <DialogTitle>Document Preview</DialogTitle>
          <DialogDescription>
            Preview of <strong>{documentType}</strong> — scroll to see the full document.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[80vh] w-full">
          {/* A4-like document container */}
          <div
            style={{
              width: '100%',
              maxWidth: '794px',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
              position: 'relative',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {/* Header image */}
            <img
              src={BAJAJ_HEADER_IMAGE}
              alt="Bajaj Finance Limited Header"
              style={{
                width: '100%',
                display: 'block',
                objectFit: 'fill',
              }}
            />

            {/* Watermark overlay */}
            <TemplateOverlay template={template} />

            {/* Document body */}
            <div
              style={{
                padding: '16px 60px',
                minHeight: '500px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Document title */}
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#111111',
                  textAlign: 'center',
                  marginBottom: '16px',
                  marginTop: '8px',
                }}
              >
                {rendered.headline}
              </h2>

              {/* Document body content */}
              {renderDocumentBody(rendered.body)}
            </div>

            {/* Footer image */}
            <img
              src={BAJAJ_FOOTER_IMAGE}
              alt="Bajaj Finance Limited Footer"
              style={{
                width: '100%',
                display: 'block',
                objectFit: 'fill',
                marginTop: '16px',
              }}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
