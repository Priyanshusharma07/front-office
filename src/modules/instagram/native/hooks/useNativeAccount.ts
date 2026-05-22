'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';
import { normaliseAccountStatus } from '@/services/instagramNative';
import type { NativeAccountStatus } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const LS_KEY = 'instagramAccountId';

/** Read the persisted accountId from localStorage (SSR-safe). */
export function getPersistedAccountId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LS_KEY);
}

/** Save accountId to localStorage. */
export function persistAccountId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, id);
}

/** Clear accountId from localStorage. */
export function clearPersistedAccountId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LS_KEY);
}

interface UseNativeAccountOptions {
  /** accountId returned by the OAuth callback or read from localStorage. */
  accountId?: string | null;
}


export function useNativeAccount({ accountId }: UseNativeAccountOptions = {}) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  /* ── Fetch + normalise account status ─────────────────
     Query is disabled until accountId is known.
     Response is normalised so all UI components work
     regardless of whether the backend returns a flat
     or a nested payload.
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
        throw new Error('[NativeIG] accountId is required');
      }

      const raw = await api.get('/instagram/native/account/status', {
        params: { accountId },
      });
      console.log('[NativeIG] account/status raw ->', raw);
      const normalised = normaliseAccountStatus(raw, accountId);
      console.log('[NativeIG] account/status normalised ->', normalised);
      return normalised;
    },
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
      clearPersistedAccountId();
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
