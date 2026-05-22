'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';
import type { AutomationConfig } from '../types';

/**
 * Manages the flat automation config (keyword-based auto-reply).
 * GET  /instagram/native/automation/config?accountId=<id>
 * POST /instagram/native/automation
 */
export function useNativeAutomationConfig(accountId: string | null | undefined) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  /* ── Fetch current config ────────────────────────── */
  const {
    data: config,
    isLoading,
    error,
    refetch,
  } = useQuery<AutomationConfig | null>({
    queryKey: ['instagram-native-automation-config', accountId],
    queryFn: async () => {
      console.log('[NativeIG] GET /instagram/native/automation/config?accountId=', accountId);
      try {
        const res = await api.get<AutomationConfig>(
          '/instagram/native/automation/config',
          { params: { accountId } }
        );
        console.log('[NativeIG] automation-config ->', res);
        return res;
      } catch (err: any) {
        // 404 means no config saved yet — treat as null (not an error)
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: Boolean(accountId),
    staleTime: 30_000,
    retry: 1,
  });

  /* ── Save config ─────────────────────────────────── */
  const saveMutation = useMutation({
    mutationFn: async (payload: AutomationConfig) => {
      console.log('[NativeIG] POST /instagram/native/automation', payload);
      return api.post('/instagram/native/automation', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['instagram-native-automation-config', accountId],
      });
    },
  });

  return {
    config,
    isLoading,
    error,
    refetch,
    saveConfig: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  };
}
