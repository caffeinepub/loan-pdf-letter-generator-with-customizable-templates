# Specification

## Summary
**Goal:** Remove all QR code functionality from the Loan Document Generator and add a mobile-only "Share PDF" button.

**Planned changes:**
- Remove the QR code tab/section from TemplateDesigner.tsx
- Remove QR code toggle and configuration fields from FormSection.tsx
- Remove QR code overlay rendering from TemplateOverlay.tsx and renderDocumentToCanvas.ts
- Remove the QRCode.js CDN script tag from index.html
- Remove calls to qrPayload.ts and renderQr.ts utilities from the render pipeline
- Add a "Share PDF" button in FormSection.tsx visible only on mobile viewports (< 768px)
- The Share PDF button uses the Web Share API (navigator.share) to share the generated PDF file, with a fallback to standard file download if the API is not supported
- The button shows a loading/disabled state while the PDF is being generated

**User-visible outcome:** QR code options no longer appear anywhere in the UI, previews, or generated PDFs. On mobile devices, users see a "Share PDF" button alongside existing download buttons that allows them to share the PDF via the native share sheet.
