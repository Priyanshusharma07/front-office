'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';
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

/**
 * Normalises the backend response into NativeAccountStatus.
 *
 * The backend /instagram/native/account/status endpoint returns either:
 *   A) Nested:  { connected, account: { id, username, profilePictureUrl, … } }
 *   B) Flat:    { connected, username, profilePicture, webhookSubscribed,
 *                 tokenActive, expiresAt, instagramBusinessId, … }
 *
 * We always produce shape A so all UI components stay unchanged.
 */
function normalise(raw: any, accountId: string): NativeAccountStatus {
  // Already nested — return as-is
  if (raw?.account && typeof raw.account === 'object') {
    // Ensure account.id is set (fallback to the query-param id)
    return {
      connected: Boolean(raw.connected),
      account: {
        id: raw.account.id ?? accountId,
        instagramUserId: raw.account.instagramUserId ?? raw.account.instagramBusinessId ?? '',
        username: raw.account.username ?? '',
        profilePictureUrl: raw.account.profilePictureUrl ?? raw.account.profilePicture ?? '',
        followersCount: raw.account.followersCount ?? 0,
        mediaCount: raw.account.mediaCount ?? 0,
        tokenExpiresAt:
          raw.account.tokenExpiresAt ??
          raw.account.expiresAt ??
          new Date(Date.now() + 60 * 24 * 3_600_000).toISOString(),
        webhooksSubscribed:
          raw.account.webhooksSubscribed ?? raw.account.webhookSubscribed ?? false,
        isActive: raw.account.isActive ?? raw.account.tokenActive ?? true,
        createdAt: raw.account.createdAt ?? new Date().toISOString(),
      },
    };
  }

  // Flat response — map fields into the nested shape
  if (!raw?.connected) {
    return { connected: false };
  }

  return {
    connected: true,
    account: {
      id: raw.accountId ?? accountId,                    // the UUID we sent as the query param
      instagramUserId: raw.instagramBusinessId ?? '',
      username: raw.username ?? '',
      profilePictureUrl: raw.profilePicture ?? raw.profilePictureUrl ?? '',
      followersCount: raw.followersCount ?? 0,
      mediaCount: raw.mediaCount ?? 0,
      tokenExpiresAt:
        raw.expiresAt ??
        raw.tokenExpiresAt ??
        new Date(Date.now() + 60 * 24 * 3_600_000).toISOString(),
      webhooksSubscribed: raw.webhookSubscribed ?? raw.webhooksSubscribed ?? false,
      isActive: raw.tokenActive ?? raw.isActive ?? true,
      createdAt: raw.createdAt ?? new Date().toISOString(),
    },
  };
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

      console.log('[NativeIG] GET /instagram/native/account/status?accountId=', accountId);
      const raw = await api.get('/instagram/native/account/status', {
        params: { accountId },
      });
      console.log('[NativeIG] account/status raw ->', raw);

      const normalised = normalise(raw, accountId);
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
