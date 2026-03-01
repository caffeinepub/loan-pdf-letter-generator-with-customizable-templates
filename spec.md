# Specification

## Summary
**Goal:** Remove the Loan GST document type from the application and add a GST watermark image asset for use on the GST Letter template.

**Planned changes:**
- Remove the GST Letter entry from the DocumentType enum
- Remove the GST Letter option from the document type selector in the form UI
- Remove all GST Letter template definitions and rendering/generation logic from getTemplate.ts
- Add the uploaded GST emblem image as a static asset at `frontend/public/assets/generated/gst-watermark.png`
- Render the GST watermark centered on the GST Letter document with reduced opacity (0.15–0.25) so it does not obscure body text, visible in both preview and downloaded PDF

**User-visible outcome:** The GST Letter document type no longer appears as an option in the UI. The GST watermark (Ashoka Pillar / Goods and Services Tax emblem) is used as a centered, semi-transparent background watermark on the GST Letter document.
