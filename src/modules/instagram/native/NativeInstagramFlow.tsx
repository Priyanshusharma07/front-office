'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { App } from 'antd';
import {
  useNativeAccount,
  getPersistedAccountId,
  persistAccountId,
  clearPersistedAccountId,
} from './hooks/useNativeAccount';
import { HeroConnect } from './components/HeroConnect';
import { NativeManagementScreen } from './components/NativeManagementScreen';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import type { ConnectionState, CallbackParams } from './types';

/* ═══════════════════════════════════════════════════════
   NativeInstagramFlow — top-level orchestrator

   Flow:
   1. On mount: read accountId from localStorage → query fires automatically
   2. On OAuth callback: extract accountId from URL → save to LS → query fires
   3. Normalise whatever shape the backend returns into NativeAccountStatus
   4. Render the correct screen based on connection state
═══════════════════════════════════════════════════════ */
export function NativeInstagramFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();

  const [flowState, setFlowState] = useState<ConnectionState>('idle');
  const [callbackHandled, setCallbackHandled] = useState(false);

  /*
   * IMPORTANT: initialise from localStorage so returning users see their
   * connected account immediately — no re-login required.
   */
  const [accountId, setAccountId] = useState<string | null>(() => getPersistedAccountId());

  const {
    accountStatus,
    isLoading,
    error,
    refetch,
    initiateConnection,
    disconnect,
    isDisconnecting,
  } = useNativeAccount({ accountId });

  /* ── 1. Handle OAuth callback query params ──────────── */
  useEffect(() => {
    if (callbackHandled) return;
    setCallbackHandled(true);

    // Read ALL params BEFORE cleaning the URL so nothing is lost
    const status      = searchParams.get('status') as CallbackParams['status'];
    const cbAccountId = searchParams.get('accountId');
    const errorParam  = searchParams.get('error');
    const errorDesc   = searchParams.get('error_description');
    const backendMsg  = searchParams.get('message');

    console.log('[NativeIG] Callback params —', { status, cbAccountId, errorParam, backendMsg });

    if (status === 'success') {
      if (!cbAccountId) {
        console.error('[NativeIG] Success callback missing accountId');
        setFlowState('error');
        message.error('Instagram authorization succeeded but account ID is missing. Please try again.');
        return;
      }

      setFlowState('processing');

      // Persist BEFORE cleaning the URL
      setAccountId(cbAccountId);
      persistAccountId(cbAccountId);           // ← save to localStorage

      // Clean the URL
      router.replace('/instagram/native', { scroll: false });

      // Query is now enabled (accountId set); refetch explicitly to transition fast
      refetch().then(() => {
        setFlowState('connected');
        message.success('Instagram Business account connected!');
      }).catch(() => {
        // error effect below will handle this
      });
    } else if (status === 'error' || errorParam) {
      setFlowState('error');
      const humanMsg =
        backendMsg  ? decodeURIComponent(backendMsg)  :
        errorDesc   ? decodeURIComponent(errorDesc)   :
        errorParam  ? decodeURIComponent(errorParam)  :
                      'Instagram authorization failed. Please try again.';
      message.error(humanMsg);
      setTimeout(() => router.replace('/instagram/native', { scroll: false }), 150);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── 2. Sync flow state from resolved account data ──── */
  useEffect(() => {
    if (isLoading) return;

    if (accountStatus?.connected) {
      // connected — show management screen regardless of whether callback just ran
      setFlowState('connected');
    } else if (accountStatus && !accountStatus.connected) {
      // explicit disconnected response → go idle
      setFlowState('idle');
    }
    // undefined means query hasn't run yet (no accountId) — don't change state
  }, [accountStatus, isLoading]);

  /* ── Handlers ─────────────────────────────────────────── */
  const handleConnect = () => {
    setFlowState('connecting');
    initiateConnection();
  };

  const handleDisconnect = () => {
    const id = accountStatus?.account?.id ?? accountId;
    if (!id) return;
    disconnect(id);
    clearPersistedAccountId();               // ← clear localStorage
    setAccountId(null);
    setFlowState('idle');
  };

  const handleReconnect = () => {
    setFlowState('connecting');
    initiateConnection();
  };

  /* ── Render ─────────────────────────────────────────── */

  // Query is in flight (accountId known, waiting for response)
  if (isLoading) {
    return <LoadingState message="Loading your Instagram account…" />;
  }

  // Browser redirecting to Instagram OAuth
  if (flowState === 'connecting') {
    return <LoadingState message="Redirecting to Instagram…" />;
  }

  // Processing the callback response
  if (flowState === 'processing') {
    return <LoadingState message="Completing connection…" />;
  }

  // API or OAuth error
  if (flowState === 'error' || (error && flowState !== 'connected')) {
    return (
      <ErrorState
        title="Connection Failed"
        message="We couldn't connect your Instagram account. This could be due to a cancelled authorization or a permissions issue."
        onRetry={() => {
          clearPersistedAccountId();
          setAccountId(null);
          setFlowState('idle');
        }}
      />
    );
  }

  /*
   * Connected — render the management screen.
   *
   * Guard: flowState === 'connected' AND we have account data.
   * The account object is guaranteed by the normaliser in useNativeAccount,
   * so `accountStatus?.account` is truthy whenever `accountStatus.connected`.
   *
   * Fallback: if accountStatus is still undefined but flowState is 'connected'
   * (race during refetch after callback) keep showing the loader.
   */
  if (flowState === 'connected') {
    if (!accountStatus?.account) {
      return <LoadingState message="Loading account details…" />;
    }
    return (
      <NativeManagementScreen
        accountStatus={accountStatus}
        onReconnect={handleReconnect}
        onDisconnect={handleDisconnect}
        isDisconnecting={isDisconnecting}
      />
    );
  }

  // Default — hero connect screen
  return <HeroConnect onConnect={handleConnect} />;
}
