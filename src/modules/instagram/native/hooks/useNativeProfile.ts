'use client';

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';
import type { InstagramProfile } from '../types';

/**
 * Fetches detailed profile for a connected Instagram Business account.
 * GET /instagram/native/profile/:accountId
 */
export function useNativeProfile(accountId: string | null | undefined) {
  const api = useApiClient();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery<InstagramProfile>({
    queryKey: ['instagram-native-profile', accountId],
    queryFn: async () => {
      console.log('[NativeIG] GET /instagram/native/profile/' + accountId);
      const res = await api.get<InstagramProfile>(`/instagram/native/profile/${accountId}`);
      console.log('[NativeIG] profile ->', res);
      return res;
    },
    enabled: Boolean(accountId),
    staleTime: 60_000,
    retry: 1,
  });

  return { profile, isLoading, error, refetch };
}
