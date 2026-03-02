# Specification

## Summary
**Goal:** Remove the "Loan Section Letter" document type from both the frontend and backend.

**Planned changes:**
- Remove "Loan Section Letter" from the document type selector in FormSection
- Remove the "Loan Section Letter" built-in template definition from `getTemplate.ts`
- Remove the "Loan Section Letter" entry from the DocumentType/LoanType enum or union in `form.ts`
- Remove the "Loan Section Letter" case from the LoanType variant in `backend/main.mo`

**User-visible outcome:** The "Loan Section Letter" option no longer appears in the document type dropdown, and all other document types continue to work without errors.
