'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';
import type { NativeAccountStatus } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useNativeAccount() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  /* ── Fetch account status ─────────────────────────── */
  const {
    data: accountStatus,
    isLoading,
    error,
    refetch,
  } = useQuery<NativeAccountStatus>({
    queryKey: ['instagram-native-account'],
    queryFn: async () => {
      console.log('[NativeIG] GET /instagram/native/account/status');
      const res = await api.get<NativeAccountStatus>('/instagram/native/account/status');
      console.log('[NativeIG] account/status ->', res);
      return res;
    },
    retry: 1,
    staleTime: 30_000,
  });

  /* ── Disconnect ───────────────────────────────────── */
  const disconnectMutation = useMutation({
    mutationFn: async (accountId: string) => {
      console.log('[NativeIG] DELETE /instagram/native/disconnect/' + accountId);
      return api.delete(`/instagram/native/disconnect/${accountId}`);
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
