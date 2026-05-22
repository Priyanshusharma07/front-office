/**
 * instagramNative.ts — Instagram Native API service layer.
 *
 * Functions accept the authenticated `api` client returned by useApiClient()
 * so they work inside React Query queryFns without re-implementing auth.
 */

import type { NativeAccountStatus, InstagramPost, PostsResponse } from '@/modules/instagram/native/types';

export type NativeApi = {
  get: <T = any>(url: string, config?: any) => Promise<T>;
  post: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
  patch: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
  delete: <T = any>(url: string, config?: any) => Promise<T>;
};

/* ─── Account status ──────────────────────────────────── */

/**
 * GET /instagram/native/account/status?accountId=<id>
 *
 * Backend returns a flat object:
 * { connected, tokenActive, webhookSubscribed, username,
 *   profilePicture, instagramBusinessId, expiresAt, … }
 */
export async function getAccountStatus(
  api: NativeApi,
  accountId: string
): Promise<NativeAccountStatus> {
  const raw = await api.get('/instagram/native/account/status', {
    params: { accountId },
  });

  return normaliseAccountStatus(raw, accountId);
}

/* ─── Posts ───────────────────────────────────────────── */

/**
 * GET /instagram/native/posts/:accountId
 */
export async function getPosts(
  api: NativeApi,
  accountId: string,
  params?: { limit?: number; cursor?: string }
): Promise<PostsResponse> {
  const raw = await api.get<PostsResponse>(`/instagram/native/posts/${accountId}`, { params });
  // Some backends return { data: [...] } or a plain array — normalise both
  if (Array.isArray(raw)) {
    return { posts: raw };
  }
  if (raw?.posts) return raw;
  // Fallback: treat entire response as posts array
  return { posts: [] };
}

/* ─── Normaliser (exported so it can be tested/reused) ── */

/**
 * Maps both flat and nested backend shapes into NativeAccountStatus.
 *
 * Flat:   { connected, username, profilePicture, webhookSubscribed,
 *            tokenActive, expiresAt, instagramBusinessId }
 * Nested: { connected, account: { id, username, profilePictureUrl, … } }
 */
export function normaliseAccountStatus(raw: any, accountId: string): NativeAccountStatus {
  // Not connected
  if (!raw?.connected) {
    return { connected: false };
  }

  // Already in nested form
  if (raw.account && typeof raw.account === 'object') {
    return {
      connected: true,
      account: {
        id:                raw.account.id                ?? accountId,
        instagramUserId:   raw.account.instagramUserId   ?? raw.account.instagramBusinessId ?? '',
        username:          raw.account.username           ?? '',
        profilePictureUrl: raw.account.profilePictureUrl ?? raw.account.profilePicture      ?? '',
        followersCount:    raw.account.followersCount     ?? 0,
        mediaCount:        raw.account.mediaCount         ?? 0,
        tokenExpiresAt:    raw.account.tokenExpiresAt     ?? raw.account.expiresAt           ??
                           new Date(Date.now() + 60 * 24 * 3_600_000).toISOString(),
        webhooksSubscribed: raw.account.webhooksSubscribed ?? raw.account.webhookSubscribed  ?? false,
        isActive:          raw.account.isActive            ?? raw.account.tokenActive         ?? true,
        createdAt:         raw.account.createdAt           ?? new Date().toISOString(),
      },
    };
  }

  // Flat response — build the nested shape
  return {
    connected: true,
    account: {
      id:                raw.accountId             ?? accountId,
      instagramUserId:   raw.instagramBusinessId   ?? '',
      username:          raw.username              ?? '',
      profilePictureUrl: raw.profilePicture        ?? raw.profilePictureUrl ?? '',
      followersCount:    raw.followersCount         ?? 0,
      mediaCount:        raw.mediaCount            ?? 0,
      tokenExpiresAt:    raw.expiresAt             ?? raw.tokenExpiresAt    ??
                         new Date(Date.now() + 60 * 24 * 3_600_000).toISOString(),
      webhooksSubscribed: raw.webhookSubscribed    ?? raw.webhooksSubscribed ?? false,
      isActive:          raw.tokenActive           ?? raw.isActive           ?? true,
      createdAt:         raw.createdAt             ?? new Date().toISOString(),
    },
  };
}
