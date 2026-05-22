'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';
import type { AutomationTrigger } from '../types';

export function useNativeAutomation(accountId: string | undefined) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  /* ── Fetch existing automations ───────────────────── */
  const { data: automations, isLoading } = useQuery<AutomationTrigger[]>({
    queryKey: ['instagram-native-automations', accountId],
    queryFn: async () => {
      console.log('[NativeIG] GET /instagram/native/automation/' + accountId);
      const res = await api.get<AutomationTrigger[]>(`/instagram/native/automation/${accountId}`);
      console.log('[NativeIG] automations ->', res);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!accountId,
    staleTime: 15_000,
  });

  /* ── Save / create automation ─────────────────────── */
  const saveMutation = useMutation({
    mutationFn: async (trigger: AutomationTrigger) => {
      console.log('[NativeIG] POST /instagram/native/automation/trigger', trigger);
      const res = await api.post('/instagram/native/automation/trigger', trigger);
      console.log('[NativeIG] save-trigger ->', res);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-native-automations'] });
    },
  });

  /* ── Delete automation ────────────────────────────── */
  const deleteMutation = useMutation({
    mutationFn: async (triggerId: string) => {
      console.log('[NativeIG] DELETE /instagram/native/automation/' + triggerId);
      return api.delete(`/instagram/native/automation/${triggerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-native-automations'] });
    },
  });

  return {
    automations: automations ?? [],
    isLoading,
    saveAutomation: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    deleteAutomation: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deletingId: deleteMutation.variables as string | undefined,
  };
}
