# Specification

## Summary
**Goal:** Replace the first footer image with the uploaded signature/branding image showing the Dhani Finance LTD. sign-off block.

**Planned changes:**
- Save the uploaded image (`20260228_092922_0002.png`) as a static asset at `frontend/public/assets/generated/footer-image-1.png`
- Update `PreviewDialog.tsx` to use the new image as the first footer image
- Update `renderDocumentToCanvas.ts` to draw the new image as the first footer image in generated PDFs
- Leave the other 3 footer images unchanged

**User-visible outcome:** The first footer image in both the document preview and generated PDFs displays the "Yours faithfully, Dhani Finance LTD." signature block with P Harish Reddy (Chief Executive Officer) details.
