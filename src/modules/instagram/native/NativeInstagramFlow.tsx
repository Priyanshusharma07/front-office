'use client';

import React, { useEffect, useRef, useState } from 'react';
import { App } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';
import { getAccountStatus, getPosts } from '@/services/instagramNative';
import {
  persistAccountId,
  clearPersistedAccountId,
  getPersistedAccountId,
} from './hooks/useNativeAccount';
import { HeroConnect } from './components/HeroConnect';
import { NativeManagementScreen } from './components/NativeManagementScreen';
import { InstagramConnectedCard, InstagramConnectedCardSkeleton } from './components/InstagramConnectedCard';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import type { NativeAccountStatus } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ═══════════════════════════════════════════════════════
   NativeInstagramFlow — completely self-contained orchestrator.

   Why window.location.search instead of useSearchParams:
   ─────────────────────────────────────────────────────
   useSearchParams() in Next.js App Router can return empty
   params on the first render tick (before Suspense resolves),
   causing the OAuth callback to be silently skipped.
   window.location.search is always accurate inside a useEffect
   because effects only run client-side, after hydration.

   Why no refetch() after setAccountId:
   ─────────────────────────────────────────────────────
   React state updates are asynchronous — calling refetch()
   immediately after setAccountId() means the queryFn closure
   still holds the old accountId (null), so it throws and the
   catch swallows it. We let React Query's `enabled` flag
   auto-trigger the query on the next render instead.
═══════════════════════════════════════════════════════ */
export function NativeInstagramFlow() {
  const { message } = App.useApp();
  const api = useApiClient();

  /* ── accountId: initialised from localStorage in effect ─────── */
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const id = getPersistedAccountId();
    if (id && !accountId) {
      setAccountId(id);
    }
  }, []);

  /* ── Connection state machine ─────────────────────── */
  type FlowState = 'idle' | 'connecting' | 'processing' | 'connected' | 'error';
  const [flowState, setFlowState] = useState<FlowState>('idle');

  // Track whether we've shown the "connected!" toast for this session
  const toastShownRef = useRef(false);

  /* ── Step 1: read OAuth callback params from the URL ─
     Uses window.location.search — reliable on every render,
     no Suspense boundary required.
  ────────────────────────────────────────────────────── */
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const status    = params.get('status');
    const cbId      = params.get('accountId');
    const errorMsg  = params.get('message') || params.get('error_description') || params.get('error');

    console.log('[NativeIG] URL params on mount —', { status, cbId, errorMsg });

    if (status === 'success' && cbId) {
      // Save immediately — React Query will pick it up on the next render
      persistAccountId(cbId);
      setAccountId(cbId);
      setFlowState('processing');

      // Clean the URL (visual only — does not trigger a re-render)
      window.history.replaceState({}, '', '/instagram/native');
    } else if (status === 'error' || errorMsg) {
      setFlowState('error');
      message.error(errorMsg ? decodeURIComponent(errorMsg) : 'Instagram authorization failed.');
      window.history.replaceState({}, '', '/instagram/native');
    }
    // If no callback params and no localStorage id → flowState stays 'idle'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Step 2: fetch account status whenever accountId is known ── */
  const {
    data: accountStatus,
    isLoading: statusLoading,
    error: statusError,
  } = useQuery<NativeAccountStatus>({
    queryKey: ['instagram-native-account', accountId],
    enabled:  Boolean(accountId),
    staleTime: 30_000,
    retry: 1,
    queryFn: () => getAccountStatus(api, accountId!),
  });

  /* ── Step 3: auto-load posts once connected ─────────── */
  const connected = accountStatus?.connected === true;

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['instagram-native-posts', accountId],
    enabled:  connected && Boolean(accountId),
    staleTime: 60_000,
    retry: 1,
    queryFn: () => getPosts(api, accountId!),
  });

  /* ── Step 4: sync flowState from resolved query data ── */
  useEffect(() => {
    if (statusLoading) return;

    if (connected) {
      setFlowState('connected');
      // Show success toast exactly once per OAuth session
      if (!toastShownRef.current && new URLSearchParams(window.location.search).get('status') !== 'success') {
        // Already resolved from localStorage (returning user) — no toast needed
      }
    } else if (accountStatus && !connected) {
      setFlowState('idle');
    }
  }, [accountStatus, statusLoading, connected]);

  /* ── Step 5: show connected toast after OAuth callback ─ */
  useEffect(() => {
    if (flowState === 'connected' && !toastShownRef.current) {
      // Only show the toast if this was triggered by a callback (processing → connected)
      const wasCallback = sessionStorage.getItem('ig_callback_pending') === '1';
      if (wasCallback) {
        message.success('Instagram Business account connected!');
        sessionStorage.removeItem('ig_callback_pending');
      }
      toastShownRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowState]);

  /* Mark the callback session so the toast fires once */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      sessionStorage.setItem('ig_callback_pending', '1');
    }
    // This runs before the clean-URL effect — order within a single render is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Handlers ─────────────────────────────────────────── */
  const handleConnect = () => {
    setFlowState('connecting');
    window.location.href = `${API_URL}/instagram/native/business-login`;
  };

  const handleReconnect = () => {
    setFlowState('connecting');
    window.location.href = `${API_URL}/instagram/native/business-login`;
  };

  const handleDisconnect = async () => {
    const id = accountStatus?.account?.id ?? accountId;
    if (!id) return;

    try {
      await api.delete(`/instagram/native/disconnect/${id}`);
    } catch {
      // best-effort
    } finally {
      clearPersistedAccountId();
      setAccountId(null);
      toastShownRef.current = false;
      setFlowState('idle');
    }
  };

  const handleRetry = () => {
    clearPersistedAccountId();
    setAccountId(null);
    setFlowState('idle');
  };

  /* ── Debug Logging ──────────────────────────────────── */
  useEffect(() => {
    console.log("ACCOUNT STATUS:", accountStatus);
    console.log("POSTS:", postsData);
  }, [accountStatus, postsData]);

  /* ── Render ─────────────────────────────────────────── */
  try {
    // Loading spinner while fetching status
    if (statusLoading || flowState === 'connecting' || flowState === 'processing') {
      const msg =
        flowState === 'connecting'  ? 'Redirecting to Instagram…' :
        flowState === 'processing'  ? 'Completing connection…'    :
                                      'Loading your Instagram account…';
      return <LoadingState message={msg} />;
    }

    // API or OAuth error
    if (flowState === 'error' || (statusError && !connected)) {
      return (
        <ErrorState
          title="Connection Failed"
          message="We couldn't load your Instagram account. Please reconnect."
          onRetry={handleRetry}
        />
      );
    }

    // Connected — show the full management screen
    if (flowState === 'connected' && accountStatus?.account) {
      return (
        <NativeManagementScreen
          accountStatus={accountStatus}
          onReconnect={handleReconnect}
          onDisconnect={handleDisconnect}
          isDisconnecting={false}
        />
      );
    }

    // Mid-transition: flowState is 'connected' but data hasn't arrived yet
    if (flowState === 'connected' && !accountStatus?.account) {
      return <LoadingState message="Loading account details…" />;
    }

    // Default: no account — show the connect hero screen
    return <HeroConnect onConnect={handleConnect} />;
  } catch (err) {
    console.error("Instagram page crashed:", err);
    return (
      <ErrorState
        title="Unexpected Error"
        message="An unexpected error occurred while loading the dashboard. Please try again."
        onRetry={handleRetry}
      />
    );
  }
}
