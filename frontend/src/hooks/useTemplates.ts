import { useState, useCallback } from 'react';
import { Template } from '../types/templates';
import {
  BUILT_IN_TEMPLATES,
  getCustomTemplates,
  saveCustomTemplates,
  normalizeTemplate,
} from '../lib/templates/getTemplate';

export function useTemplates() {
  const [customTemplates, setCustomTemplates] = useState<Template[]>(() => getCustomTemplates());

  const allTemplates = [...BUILT_IN_TEMPLATES, ...customTemplates];

  const getTemplateById = useCallback(
    (id: string): Template | undefined => {
      return allTemplates.find((t) => t.id === id);
    },
    [allTemplates]
  );

  const getTemplateByDocType = useCallback(
    (docType: string): Template | undefined => {
      return allTemplates.find((t) => t.documentType === docType);
    },
    [allTemplates]
  );

  const addCustomTemplate = useCallback((template: Template) => {
    setCustomTemplates((prev) => {
      const updated = [...prev, template];
      saveCustomTemplates(updated);
      return updated;
    });
  }, []);

  const updateCustomTemplate = useCallback((id: string, updates: Partial<Template>) => {
    setCustomTemplates((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? normalizeTemplate({ ...t, ...updates }) : t
      );
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

  return {
    builtInTemplates: BUILT_IN_TEMPLATES,
    customTemplates,
    allTemplates,
    getTemplateById,
    getTemplateByDocType,
    addCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
  };
}
