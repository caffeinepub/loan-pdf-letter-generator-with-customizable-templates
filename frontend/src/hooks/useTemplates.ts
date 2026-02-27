import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { DocumentType } from '../types/form';
import { Template, CustomTemplate } from '../types/templates';
import {
  getTemplate,
  getCustomTemplates,
  saveCustomTemplates,
  normalizeTemplate,
  BUILT_IN_DOC_TYPES,
} from '../lib/templates/getTemplate';
import { useGetAllTemplates, useAddCustomTemplate, useUpdateCustomTemplate } from './useQueries';
import type { GlobalMasterTemplate } from '../backend';
import { Variant_stacked_sideBySide, Variant_twoColumn_centered } from '../backend';

// ── Serialization helpers ─────────────────────────────────────────────────────
// We store the full frontend Template as JSON inside optionalCustomFieldValue.
// adminId = templateId, businessName = template name (for display).

function serializeTemplate(templateId: string, template: Template): GlobalMasterTemplate {
  return {
    adminId: templateId,
    businessName: template.businessName ?? '',
    businessAddress: template.businessAddress ?? '',
    optionalCustomFieldLabel: 'serialized_template',
    optionalCustomFieldValue: JSON.stringify(template),
    layout: {
      headerColor: template.headerColor ?? '#1a365d',
      footerText: template.footerText ?? '',
      showQrCode: false,
      qrPayload: '',
      showWatermark: false,
      watermarkText: template.watermarkText ?? '',
      watermarkOpacity: BigInt(30),
      signatureLayout: Variant_stacked_sideBySide.stacked,
      footerLayout: Variant_twoColumn_centered.centered,
    },
  };
}

function deserializeTemplate(gmt: GlobalMasterTemplate): CustomTemplate | null {
  try {
    if (
      gmt.optionalCustomFieldLabel === 'serialized_template' &&
      gmt.optionalCustomFieldValue
    ) {
      const parsed = JSON.parse(gmt.optionalCustomFieldValue) as Partial<Template>;
      const normalized = normalizeTemplate(parsed);
      // Ensure id and name are set (required for CustomTemplate)
      const id = (normalized.id && normalized.id !== '') ? normalized.id : gmt.adminId;
      const name = (normalized.name && normalized.name !== '') ? normalized.name : gmt.businessName || id;
      return { ...normalized, id, name } as CustomTemplate;
    }
  } catch {
    // fall through
  }
  return null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseTemplatesReturn {
  builtInTemplates: Record<DocumentType, Template>;
  customTemplates: CustomTemplate[];
  isLoading: boolean;
  isError: boolean;
  isSaving: boolean;
  saveError: string | null;
  clearSaveError: () => void;
  updateBuiltInTemplate: (docType: DocumentType, updates: Partial<Template>) => void;
  saveTemplate: (docType: DocumentType) => void;
  createCustomTemplate: (name: string) => void;
  updateCustomTemplate: (id: string, updates: Partial<CustomTemplate>) => void;
  deleteCustomTemplate: (id: string) => void;
  applyHeaderToAllTemplates: (
    businessName: string,
    businessAddress: string,
    logoDataUrl: string | null
  ) => boolean;
  saveCustomTemplateToBackend: (template: CustomTemplate) => Promise<void>;
  getTemplateById: (id: string) => Template | undefined;
}

export function useTemplates(): UseTemplatesReturn {
  const queryClient = useQueryClient();

  // Built-in templates (local state, initialized from localStorage)
  const [builtInTemplates, setBuiltInTemplates] = useState<Record<DocumentType, Template>>(() => {
    const result = {} as Record<DocumentType, Template>;
    for (const dt of BUILT_IN_DOC_TYPES) {
      result[dt] = getTemplate(dt);
    }
    return result;
  });

  // Custom templates: start from localStorage, then merge with backend
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(
    () => getCustomTemplates()
  );

  // Surface save errors to the UI
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: backendTemplates } = useGetAllTemplates();

  const addMutation = useAddCustomTemplate();
  const updateMutation = useUpdateCustomTemplate();

  const isSaving = addMutation.isPending || updateMutation.isPending;

  const clearSaveError = useCallback(() => setSaveError(null), []);

  // Sync backend templates into local state (merge — backend is source of truth for custom)
  useEffect(() => {
    if (!backendTemplates || backendTemplates.length === 0) return;
    const parsed: CustomTemplate[] = [];
    for (const gmt of backendTemplates) {
      const t = deserializeTemplate(gmt);
      if (t) parsed.push(t);
    }
    if (parsed.length > 0) {
      setCustomTemplates(parsed);
      saveCustomTemplates(parsed);
    }
  }, [backendTemplates]);

  // ── Built-in template mutations ──────────────────────────────────────────

  const updateBuiltInTemplate = useCallback((docType: DocumentType, updates: Partial<Template>) => {
    setBuiltInTemplates((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], ...updates },
    }));
  }, []);

  const saveTemplate = useCallback((docType: DocumentType) => {
    setBuiltInTemplates((prev) => {
      const template = prev[docType];
      try {
        localStorage.setItem(`loan_template_${docType}`, JSON.stringify(template));
      } catch {
        // ignore
      }
      return prev;
    });
  }, []);

  // ── Custom template mutations ────────────────────────────────────────────

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
    queryClient.invalidateQueries({ queryKey: ['allTemplates'] });
  }, [queryClient]);

  // ── Backend save ─────────────────────────────────────────────────────────

  const saveCustomTemplateToBackend = useCallback(
    async (template: CustomTemplate) => {
      setSaveError(null);
      const gmt = serializeTemplate(template.id, template);
      const exists = backendTemplates?.some((t) => t.adminId === template.id);
      try {
        if (exists) {
          await updateMutation.mutateAsync({ templateId: template.id, template: gmt });
        } else {
          await addMutation.mutateAsync({ templateId: template.id, template: gmt });
        }
        setCustomTemplates((prev) => {
          const idx = prev.findIndex((t) => t.id === template.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = template;
            saveCustomTemplates(next);
            return next;
          }
          const next = [...prev, template];
          saveCustomTemplates(next);
          return next;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save template. Please try again.';
        setSaveError(message);
        throw new Error(message);
      }
    },
    [backendTemplates, addMutation, updateMutation]
  );

  // ── Apply header to all ──────────────────────────────────────────────────

  const applyHeaderToAllTemplates = useCallback(
    (businessName: string, businessAddress: string, logoDataUrl: string | null): boolean => {
      try {
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
            try {
              localStorage.setItem(`loan_template_${dt}`, JSON.stringify(updatedTemplate));
            } catch {
              // ignore
            }
          }
          return updated;
        });

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

  // ── Template lookup ──────────────────────────────────────────────────────

  const getTemplateById = useCallback(
    (id: string): Template | undefined => {
      const builtIn = builtInTemplates[id as DocumentType];
      if (builtIn) return builtIn;
      return customTemplates.find((t) => t.id === id);
    },
    [builtInTemplates, customTemplates]
  );

  return {
    builtInTemplates,
    customTemplates,
    isLoading: false,
    isError: false,
    isSaving,
    saveError,
    clearSaveError,
    updateBuiltInTemplate,
    saveTemplate,
    createCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
    applyHeaderToAllTemplates,
    saveCustomTemplateToBackend,
    getTemplateById,
  };
}
