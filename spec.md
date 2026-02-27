# Specification

## Summary
**Goal:** Fix the document footer layout and add 4 images displayed horizontally in the footer area of the rendered loan document.

**Planned changes:**
- Fix footer alignment, padding, margins, and styling in both `PreviewDialog.tsx` and `renderDocumentToCanvas.ts` to be visually consistent with the overall document design
- Add 4 static images served from `frontend/public/assets/generated/` and render them horizontally and evenly spaced in the footer row in both the preview dialog and PDF canvas output

**User-visible outcome:** The document footer is properly aligned and styled, and displays 4 images laid out horizontally — visible in both the preview dialog and the exported PDF.
