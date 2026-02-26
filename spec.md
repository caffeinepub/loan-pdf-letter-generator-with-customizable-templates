# Specification

## Summary
**Goal:** Enhance the Loan Document Generator's template editor with an explicit Save button, an "Apply Header to All Templates" action, and an automatic share flow triggered after document download.

**Planned changes:**
- Add a "Save" button inside the TemplateDesigner component that saves the current template to localStorage and briefly shows a "Saved!" confirmation state before reverting.
- Add an "Apply Header to All Templates" button in the template editor that, after a confirmation prompt, copies the current template's header settings (business name, address, logo) to all other templates in localStorage and shows a success message.
- After a document (PNG/PDF) is successfully downloaded in FormSection, automatically present a "Share" option using the Web Share API (via the existing `sharePdf` utility), falling back to re-triggering the download if the API is unsupported.

**User-visible outcome:** Users can explicitly save templates, propagate header branding across all templates at once, and share downloaded documents immediately after download completes.
