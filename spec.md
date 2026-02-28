# Specification

## Summary
**Goal:** Rebuild the Loan Document Generator application from scratch with a Motoko backend and a full-featured React frontend for generating, previewing, and downloading loan documents.

**Planned changes:**
- Create a Motoko backend actor with CRUD for user profiles, global and custom document templates, loan document storage, and role-based access control
- Build a loan form UI collecting applicant details, loan parameters (amount, interest rate, tenure, processing charge), bank account fields, and dynamic custom key-value fields with automatic EMI calculation
- Implement a Template Designer dialog for viewing built-in templates and creating/editing/deleting custom templates with background image, watermark, logo, seal, and signature configuration
- Implement a document preview modal (PreviewDialog) that renders the filled template on an A4 canvas with two-column header, body content, watermark/seal/signature overlays, and a footer with images in rows of 4 then 3
- Implement PDF generation and download by rendering the canvas to JPEG and assembling raw PDF syntax, with Web Share API support and download fallback
- Integrate Internet Identity authentication for login/logout, scoping custom templates and documents to the authenticated user while allowing unauthenticated access to built-in templates
- Apply a professional warm amber/orange color palette with card-based layout, clear typography, and responsive design for desktop and tablet

**User-visible outcome:** Users can fill out a loan application form, auto-calculate EMIs, design or select document templates, preview the filled document in a modal, and download or share a PDF — with optional Internet Identity login to save and manage custom templates.
