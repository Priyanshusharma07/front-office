'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';
import type { WebhookEventsResponse } from '../types';

/**
 * Fetches recent webhook events for a connected account.
 * GET /instagram/native/webhook/events?accountId=<id>
 *
 * Also exposes a subscribe mutation:
 * POST /instagram/native/webhook/subscribe
 */
export function useNativeWebhookEvents(accountId: string | null | undefined) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  /* ── Fetch events ────────────────────────────────── */
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<WebhookEventsResponse>({
    queryKey: ['instagram-native-webhook-events', accountId],
    queryFn: async () => {
      console.log('[NativeIG] GET /instagram/native/webhook/events?accountId=', accountId);
      const res = await api.get<WebhookEventsResponse>('/instagram/native/webhook/events', {
        params: { accountId },
      });
      console.log('[NativeIG] webhook-events ->', res);
      return res;
    },
    enabled: Boolean(accountId),
    staleTime: 10_000,
    refetchInterval: 30_000, // light auto-refresh every 30 s
    retry: 1,
  });

  /* ── Subscribe webhook ───────────────────────────── */
  const subscribeMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('[NativeIG] POST /instagram/native/webhook/subscribe', { accountId: id });
      return api.post('/instagram/native/webhook/subscribe', { accountId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-native-account'] });
      queryClient.invalidateQueries({ queryKey: ['instagram-native-webhook-events', accountId] });
    },
  });

  return {
    events: data?.events ?? [],
    total: data?.total,
    isLoading,
    isFetching,
    error,
    refetch,
    subscribeWebhook: subscribeMutation.mutateAsync,
    isSubscribing: subscribeMutation.isPending,
    subscribeError: subscribeMutation.error,
  };
}
