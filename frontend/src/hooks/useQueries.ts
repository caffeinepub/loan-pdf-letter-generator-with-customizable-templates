import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, TemplateResult } from '../backend';

function throwIfTemplateError(result: TemplateResult): void {
  if (result.__kind__ === 'alreadyExists') {
    throw new Error('A template with this ID already exists');
  }
  if (result.__kind__ === 'notFound') {
    throw new Error('Template not found');
  }
  if (result.__kind__ === 'unauthorizedField') {
    throw new Error('You are not authorized to perform this action');
  }
  if (result.__kind__ === 'unexpectedError') {
    throw new Error(`Unexpected error: ${result.unexpectedError}`);
  }
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllTemplates() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTemplates();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddCustomTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, template }: { templateId: string; template: any }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addCustomTemplate(templateId, template);
      throwIfTemplateError(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useUpdateCustomTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, template }: { templateId: string; template: any }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateCustomTemplate(templateId, template);
      throwIfTemplateError(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}
