# Specification

## Summary
**Goal:** Add a new built-in "TDS Deduction Intimation" letter template to the Loan Document Generator's template library.

**Planned changes:**
- Add a new template named "TDS Deduction Intimation" to `frontend/src/lib/templates/getTemplate.ts` with the specified letter body, including fixed literal values (APLOAN74962926, PLOAN6926946926) and dynamic placeholders (`{{name}}`, `{{loanType}}`, `{{loanAmount}}`, `{{processingCharge}}`)
- Register the new template's document type identifier consistently with existing naming conventions so it appears in all template listing and selection locations (template selector dropdown, TemplateDesigner, etc.)

**User-visible outcome:** Users can select "TDS Deduction Intimation" from the template selector, preview the populated letter with their form values substituted, and generate/download it as a PDF via the existing document generation flow.
