import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { GlobalMasterTemplate, TemplateResult } from '../backend';

// ── Helpers ───────────────────────────────────────────────────────────────────

function throwIfTemplateError(result: TemplateResult): void {
  switch (result.__kind__) {
    case 'success':
      return;
    case 'alreadyExists':
      throw new Error('A template with this ID already exists. Please use a different name or update the existing template.');
    case 'notFound':
      throw new Error('Template not found. It may have been deleted. Please refresh and try again.');
    case 'unauthorizedField':
      throw new Error('You are not authorized to save this template. Please log in and try again.');
    case 'unexpectedError':
      throw new Error(`Save failed: ${result.unexpectedError}`);
    default:
      throw new Error('An unexpected error occurred while saving the template.');
  }
}

// ── Template Query Hooks ──────────────────────────────────────────────────────

export function useGetAllTemplates() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GlobalMasterTemplate[]>({
    queryKey: ['allTemplates'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllTemplates();
      } catch (err) {
        // Silently fall back to empty array — built-in templates will be used
        console.warn('Failed to fetch templates from backend, using local templates:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on failure — avoid blocking the UI
    // Never throw to error boundary
    throwOnError: false,
  });
}

export function useGetCustomTemplateById(templateId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GlobalMasterTemplate | null>({
    queryKey: ['customTemplate', templateId],
    queryFn: async () => {
      if (!actor || !templateId) return null;
      try {
        return await actor.getCustomTemplateById(templateId);
      } catch (err) {
        console.warn('Failed to fetch custom template by id:', err);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!templateId,
    retry: false,
    throwOnError: false,
  });
}

export function useAddCustomTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      template,
    }: {
      templateId: string;
      template: GlobalMasterTemplate;
    }) => {
      if (!actor) throw new Error('Actor not available. Please ensure you are logged in.');
      const result = await actor.addCustomTemplate(templateId, template);
      // Throw a descriptive error if the backend returned a non-success variant
      throwIfTemplateError(result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTemplates'] });
    },
  });
}

export function useUpdateCustomTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      template,
    }: {
      templateId: string;
      template: GlobalMasterTemplate;
    }) => {
      if (!actor) throw new Error('Actor not available. Please ensure you are logged in.');
      const result = await actor.updateCustomTemplate(templateId, template);
      // Throw a descriptive error if the backend returned a non-success variant
      throwIfTemplateError(result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTemplates'] });
    },
  });
}
