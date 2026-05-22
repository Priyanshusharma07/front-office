'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';
import type { NativeAccountStatus } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UseNativeAccountOptions {
  /** accountId returned by the OAuth callback. Query is disabled until provided. */
  accountId?: string | null;
}

export function useNativeAccount({ accountId }: UseNativeAccountOptions = {}) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  /* ── Fetch account status ─────────────────────────────
     Only fires when we have an accountId. This prevents the
     "accountId is required" error when the page first loads
     without an active callback redirect.
  ─────────────────────────────────────────────────────── */
  const {
    data: accountStatus,
    isLoading,
    error,
    refetch,
  } = useQuery<NativeAccountStatus>({
    queryKey: ['instagram-native-account', accountId],
    queryFn: async () => {
      if (!accountId) {
        console.error('[NativeIG] accountId is missing – aborting status fetch');
        throw new Error('accountId is required');
      }

      console.log('[NativeIG] GET /instagram/native/account/status?accountId=', accountId);
      const res = await api.get<NativeAccountStatus>('/instagram/native/account/status', {
        params: { accountId },
      });
      console.log('[NativeIG] account/status ->', res);
      return res;
    },
    // Do not fetch until accountId is known
    enabled: Boolean(accountId),
    retry: 1,
    staleTime: 30_000,
  });

  /* ── Disconnect ───────────────────────────────────── */
  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('[NativeIG] DELETE /instagram/native/disconnect/' + id);
      return api.delete(`/instagram/native/disconnect/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-native-account'] });
    },
  });

  /* ── Initiate OAuth ───────────────────────────────── */
  const initiateConnection = () => {
    console.log('[NativeIG] Redirecting to business-login');
    window.location.href = `${API_URL}/instagram/native/business-login`;
  };

  return {
    accountStatus,
    isLoading,
    error,
    refetch,
    initiateConnection,
    disconnect: (id: string) => disconnectMutation.mutate(id),
    isDisconnecting: disconnectMutation.isPending,
    disconnectError: disconnectMutation.error,
  };
}
