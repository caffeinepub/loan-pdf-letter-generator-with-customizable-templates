import { useState, useCallback } from 'react';
import { DocumentType, Template, CustomTemplate } from '../types/templates';
import { getTemplate, getCustomTemplates, saveCustomTemplates } from '../lib/templates/getTemplate';

const BUILT_IN_DOC_TYPES: DocumentType[] = [
  'Loan Approval Letter',
  'Loan GST Letter',
  'Loan Section Letter',
];

function saveBuiltInTemplate(docType: DocumentType, template: Template): void {
  try {
    const stored = localStorage.getItem('document-templates');
    const templates = stored ? JSON.parse(stored) : {};
    templates[docType] = template;
    localStorage.setItem('document-templates', JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving template:', error);
  }
}

export function useTemplates() {
  const [builtInTemplates, setBuiltInTemplates] = useState<Record<DocumentType, Template>>(() => {
    const result = {} as Record<DocumentType, Template>;
    for (const dt of BUILT_IN_DOC_TYPES) {
      result[dt] = getTemplate(dt);
    }
    return result;
  });

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(
    () => getCustomTemplates()
  );

  const updateBuiltInTemplate = useCallback((docType: DocumentType, updates: Partial<Template>) => {
    setBuiltInTemplates((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], ...updates },
    }));
  }, []);

  const saveTemplate = useCallback((docType: DocumentType) => {
    setBuiltInTemplates((prev) => {
      const template = prev[docType];
      saveBuiltInTemplate(docType, template);
      return prev;
    });
  }, []);

  const createCustomTemplate = useCallback((name: string) => {
    const base = getTemplate('Loan Approval Letter');
    const newTemplate: CustomTemplate = {
      ...base,
      id: `custom-${Date.now()}`,
      name,
      headline: name,
    };
    setCustomTemplates((prev) => {
      const updated = [...prev, newTemplate];
      saveCustomTemplates(updated);
      return updated;
    });
  }, []);

  const updateCustomTemplate = useCallback((id: string, updates: Partial<CustomTemplate>) => {
    setCustomTemplates((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      saveCustomTemplates(updated);
      return updated;
    });
  }, []);

  const deleteCustomTemplate = useCallback((id: string) => {
    setCustomTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveCustomTemplates(updated);
      return updated;
    });
  }, []);

  const applyHeaderToAllTemplates = useCallback(
    (businessName: string, businessAddress: string, logoDataUrl: string | null): boolean => {
      try {
        // Update built-in templates
        setBuiltInTemplates((prev) => {
          const updated = { ...prev };
          for (const dt of BUILT_IN_DOC_TYPES) {
            const updatedTemplate: Template = {
              ...prev[dt],
              businessName,
              businessAddress,
              ...(logoDataUrl !== null ? { logoDataUrl } : {}),
            };
            updated[dt] = updatedTemplate;
            saveBuiltInTemplate(dt, updatedTemplate);
          }
          return updated;
        });

        // Update custom templates
        setCustomTemplates((prev) => {
          const updated = prev.map((t) => ({
            ...t,
            businessName,
            businessAddress,
            ...(logoDataUrl !== null ? { logoDataUrl } : {}),
          }));
          saveCustomTemplates(updated);
          return updated;
        });

        return true;
      } catch {
        return false;
      }
    },
    []
  );

  return {
    builtInTemplates,
    customTemplates,
    updateBuiltInTemplate,
    saveTemplate,
    createCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
    applyHeaderToAllTemplates,
  };
}
