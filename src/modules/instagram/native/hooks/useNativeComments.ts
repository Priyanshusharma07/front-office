'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';
import type { CommentsResponse } from '../types';

/**
 * Fetches comments for a specific Instagram post and provides
 * reply + hide mutation actions.
 * GET /instagram/native/post/:mediaId/comments
 */
export function useNativeComments(mediaId: string | null | undefined) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  /* ── Fetch comments ──────────────────────────────── */
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<CommentsResponse>({
    queryKey: ['instagram-native-comments', mediaId],
    queryFn: async () => {
      console.log('[NativeIG] GET /instagram/native/post/' + mediaId + '/comments');
      const res = await api.get<CommentsResponse>(`/instagram/native/post/${mediaId}/comments`);
      console.log('[NativeIG] comments ->', res);
      return res;
    },
    enabled: Boolean(mediaId),
    staleTime: 15_000,
    retry: 1,
  });

  /* ── Reply to comment ────────────────────────────── */
  const replyMutation = useMutation({
    mutationFn: async ({ commentId, message }: { commentId: string; message: string }) => {
      console.log('[NativeIG] POST /instagram/native/comment/reply', { commentId });
      return api.post('/instagram/native/comment/reply', { commentId, message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-native-comments', mediaId] });
    },
  });

  /* ── Hide comment ────────────────────────────────── */
  const hideMutation = useMutation({
    mutationFn: async ({ commentId, hide }: { commentId: string; hide: boolean }) => {
      console.log('[NativeIG] PATCH /instagram/native/comment/hide', { commentId, hide });
      return api.patch('/instagram/native/comment/hide', { commentId, hide });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-native-comments', mediaId] });
    },
  });

  return {
    comments: data?.comments ?? [],
    total: data?.total,
    isLoading,
    error,
    refetch,
    replyToComment: replyMutation.mutateAsync,
    isReplying: replyMutation.isPending,
    replyError: replyMutation.error,
    hideComment: hideMutation.mutateAsync,
    isHiding: hideMutation.isPending,
  };
}
