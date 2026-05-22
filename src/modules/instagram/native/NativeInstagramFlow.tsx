'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { App } from 'antd';
import { useNativeAccount } from './hooks/useNativeAccount';
import { HeroConnect } from './components/HeroConnect';
import { NativeManagementScreen } from './components/NativeManagementScreen';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import type { ConnectionState, CallbackParams } from './types';

/* ═══════════════════════════════════════════════════════
   NativeInstagramFlow — top-level orchestrator

   Reads OAuth callback query params, manages flow state,
   and renders the correct screen.
═══════════════════════════════════════════════════════ */
export function NativeInstagramFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();

  const [flowState, setFlowState] = useState<ConnectionState>('idle');
  const [callbackHandled, setCallbackHandled] = useState(false);
  // Persists the accountId from the OAuth callback so the hook can query the API
  const [accountId, setAccountId] = useState<string | null>(null);

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
    const status       = searchParams.get('status') as CallbackParams['status'];
    const cbAccountId  = searchParams.get('accountId');
    const errorParam   = searchParams.get('error');
    const errorDesc    = searchParams.get('error_description');
    // Backend may also send a human-readable 'message' on error
    const backendMsg   = searchParams.get('message');

    console.log('[NativeIG] Callback params —', { status, cbAccountId, errorParam, backendMsg });

    if (status === 'success') {
      if (!cbAccountId) {
        console.error('[NativeIG] Success callback received but accountId is missing in URL');
        setFlowState('error');
        message.error('Instagram authorization succeeded but account ID is missing. Please try again.');
        return;
      }

      setFlowState('processing');
      // Persist accountId in state BEFORE cleaning the URL so the hook can use it
      setAccountId(cbAccountId);
      // Now it's safe to clean the URL
      router.replace('/instagram/native', { scroll: false });

      // accountId is now set → hook will auto-fetch; transition when done
      refetch().then(() => {
        setFlowState('connected');
        message.success('Instagram Business account connected!');
      });
    } else if (status === 'error' || errorParam) {
      setFlowState('error');
      const humanMsg =
        backendMsg
          ? decodeURIComponent(backendMsg)
          : errorDesc
          ? decodeURIComponent(errorDesc)
          : errorParam
          ? decodeURIComponent(errorParam)
          : 'Instagram authorization failed. Please try again.';
      message.error(humanMsg);
      // Clean URL after a brief delay
      setTimeout(() => router.replace('/instagram/native', { scroll: false }), 150);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── 2. Sync flow state from account data ───────────── */
  useEffect(() => {
    if (isLoading) return;
    if (accountStatus?.connected) {
      setFlowState('connected');
    } else if (accountStatus && !accountStatus.connected) {
      setFlowState('idle');
    }
  }, [accountStatus, isLoading]);

  /* ── Handlers ─────────────────────────────────────────── */
  const handleConnect = () => {
    setFlowState('connecting');
    initiateConnection(); // redirects window.location
  };

  const handleDisconnect = () => {
    if (!accountStatus?.account?.id) return;
    disconnect(accountStatus.account.id);
    setAccountId(null);
    setFlowState('idle');
  };

  const handleReconnect = () => {
    setFlowState('connecting');
    initiateConnection();
  };

  /* ── Render ─────────────────────────────────────────── */

  // Initial data load (no accountId in state yet; query is disabled)
  if (isLoading) {
    return <LoadingState message="Loading your Instagram account…" />;
  }

  // Redirecting to Instagram
  if (flowState === 'connecting') {
    return <LoadingState message="Redirecting to Instagram…" />;
  }

  // Processing callback
  if (flowState === 'processing') {
    return <LoadingState message="Completing connection…" />;
  }

  // Error
  if (flowState === 'error' || (error && flowState !== 'connected')) {
    return (
      <ErrorState
        title="Connection Failed"
        message="We couldn't connect your Instagram account. This could be due to a cancelled authorization or a permissions issue."
        onRetry={() => setFlowState('idle')}
      />
    );
  }

  // Connected — show full management screen
  if (flowState === 'connected' && accountStatus?.account) {
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
