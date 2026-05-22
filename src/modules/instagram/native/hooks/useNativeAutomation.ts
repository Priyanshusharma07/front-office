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
      const res = await api.get<any>(`/instagram/native/automation/${accountId}`);
      console.log('[NativeIG] automations ->', res);
      // Map backend entity to frontend AutomationTrigger
      if (!res) return [];
      
      let keyword = '';
      let matchType = 'contains';
      if (res.keywords && res.keywords.length > 0) {
        const firstKw = res.keywords[0];
        if (firstKw.startsWith('exact:')) {
          matchType = 'exact';
          keyword = firstKw.replace('exact:', '');
        } else if (firstKw.startsWith('contains:')) {
          matchType = 'contains';
          keyword = firstKw.replace('contains:', '');
        } else {
          keyword = firstKw;
        }
      }

      const trigger: AutomationTrigger = {
        id: res.id,
        accountId: res.accountId,
        triggerType: 'comment',
        triggerKeyword: keyword,
        matchType: matchType as 'exact' | 'contains',
        replyMessage: res.replyMessage,
        replyType: res.replyType === 'private' ? 'dm' : 'comment_reply',
        isActive: res.isEnabled,
      };
      
      return [trigger];
    },
    enabled: !!accountId,
    staleTime: 15_000,
  });

  /* ── Save / create automation ─────────────────────── */
  const saveMutation = useMutation({
    mutationFn: async (trigger: AutomationTrigger) => {
      // Map to UpsertAutomationDto expected by backend
      const payload = {
        accountId: accountId!,
        keywords: trigger.triggerKeyword ? [`${trigger.matchType || 'contains'}:${trigger.triggerKeyword}`] : [],
        replyType: trigger.replyType === 'dm' ? 'private' : 'public',
        replyMessage: trigger.replyMessage,
      };
      console.log('[NativeIG] POST /instagram/native/automation', payload);
      const res = await api.post('/instagram/native/automation', payload);
      console.log('[NativeIG] save-automation ->', res);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-native-automations'] });
    },
  });

  /* ── Delete automation ────────────────────────────── */
  const deleteMutation = useMutation({
    mutationFn: async () => {
      console.log('[NativeIG] DELETE /instagram/native/automation/' + accountId);
      return api.delete(`/instagram/native/automation/${accountId}`);
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
