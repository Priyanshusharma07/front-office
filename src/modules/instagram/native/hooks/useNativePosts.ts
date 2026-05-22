'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';
import type { PostsResponse } from '../types';

const PAGE_LIMIT = 12;

/**
 * Fetches posts for a connected Instagram Business account with cursor pagination.
 * GET /instagram/native/posts/:accountId?limit=12&cursor=...
 */
export function useNativePosts(accountId: string | null | undefined) {
  const api = useApiClient();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ['instagram-native-posts', accountId],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, any> = { limit: PAGE_LIMIT };
      if (pageParam) params.cursor = pageParam;

      console.log('[NativeIG] GET /instagram/native/posts/' + accountId, params);
      const res = await api.get<PostsResponse>(`/instagram/native/posts/${accountId}`, { params });
      console.log('[NativeIG] posts ->', res);
      return res;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? lastPage.pagination.cursor : undefined,
    enabled: Boolean(accountId),
    staleTime: 30_000,
    retry: 1,
  });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  return {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage: Boolean(hasNextPage),
    fetchNextPage,
    error,
    refetch,
  };
}
