'use client';

import React, { useState } from 'react';
import { App } from 'antd';
import { useSearchParams } from 'next/navigation';
import NativeConnectPage from './NativeConnectPage';
import NativeAutomationScreen from './NativeAutomationScreen';
import type { NativeView } from './types';

/* ═══════════════════════════════════════════════════════
   NativeInstagramFlow
   
   Orchestrates the two-view flow:
     connect  →  automation
   
   Reads ?status=success&accountId=xxx from URL on mount
   and passes them down to NativeConnectPage.
═══════════════════════════════════════════════════════ */
export default function NativeInstagramFlow() {
  const searchParams = useSearchParams();

  /* ── Read callback params (only on initial render) ── */
  const initialStatus = (searchParams.get('status') as 'success' | 'error' | null) ?? null;
  const initialAccountId = searchParams.get('accountId') ?? null;
  const initialError = searchParams.get('error') ?? null;

  /* ── View state ───────────────────────────────────── */
  const [view, setView] = useState<NativeView>('connect');
  const [activeAccountId, setActiveAccountId] = useState<string | null>(
    initialAccountId ?? null
  );
  const [activeBusinessId, setActiveBusinessId] = useState<string | undefined>();

  const handleViewChange = (nextView: NativeView, accountId?: string) => {
    if (accountId) setActiveAccountId(accountId);
    setView(nextView);
  };

  /* ── Render ───────────────────────────────────────── */
  return (
    <App>
      {view === 'connect' ? (
        <NativeConnectPage
          initialAccountId={initialAccountId}
          initialStatus={initialStatus}
          initialError={initialError}
          onViewChange={handleViewChange}
        />
      ) : (
        <NativeAutomationScreen
          accountId={activeAccountId ?? ''}
          instagramBusinessId={activeBusinessId}
          onBack={() => setView('connect')}
          onSaved={() => {
            // Stay on automation screen showing the saved state
          }}
        />
      )}
    </App>
  );
}
