'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { App } from 'antd';
import { useNativeAccount } from './hooks/useNativeAccount';
import { HeroConnect } from './components/HeroConnect';
import { ConnectedCard } from './components/ConnectedCard';
import { NativeAutomationScreen } from './components/NativeAutomationScreen';
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
  const [showAutomation, setShowAutomation] = useState(false);
  const [callbackHandled, setCallbackHandled] = useState(false);

  const {
    accountStatus,
    isLoading,
    error,
    refetch,
    initiateConnection,
    disconnect,
    isDisconnecting,
  } = useNativeAccount();

  /* ── 1. Handle OAuth callback query params ──────────── */
  useEffect(() => {
    if (callbackHandled) return;
    setCallbackHandled(true);

    const status = searchParams.get('status') as CallbackParams['status'];
    const errorParam = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    console.log('[NativeIG] Callback params — status:', status, 'error:', errorParam);

    if (status === 'success') {
      setFlowState('processing');
      // Clean URL immediately
      router.replace('/instagram/native', { scroll: false });

      // Refetch account data then transition to connected
      refetch().then(() => {
        setFlowState('connected');
        message.success('Instagram Business account connected!');
        // Auto-open automation setup after a brief pause
        setTimeout(() => setShowAutomation(true), 800);
      });
    } else if (status === 'error' || errorParam) {
      setFlowState('error');
      const humanMsg = errorDesc
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
    setFlowState('idle');
    setShowAutomation(false);
  };

  const handleReconnect = () => {
    setFlowState('connecting');
    initiateConnection();
  };

  /* ── Render ─────────────────────────────────────────── */

  // Initial data load
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

  // Automation configuration
  if (showAutomation && accountStatus?.account) {
    return (
      <App>
        <NativeAutomationScreen
          account={{
            id: accountStatus.account.id,
            username: accountStatus.account.username,
          }}
          onBack={() => {
            setShowAutomation(false);
            setFlowState('connected');
          }}
        />
      </App>
    );
  }

  // Connected — show account card
  if (flowState === 'connected' && accountStatus?.account) {
    return (
      <ConnectedCard
        account={accountStatus.account}
        onConfigureAutomation={() => {
          setShowAutomation(true);
          setFlowState('configuring');
        }}
        onDisconnect={handleDisconnect}
        onReconnect={handleReconnect}
        isDisconnecting={isDisconnecting}
      />
    );
  }

  // Default — hero connect screen
  return <HeroConnect onConnect={handleConnect} />;
}
