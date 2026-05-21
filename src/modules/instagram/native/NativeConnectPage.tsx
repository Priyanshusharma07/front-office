'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Button, Typography, Tag, Avatar, Popconfirm, Spin, Alert, Tooltip, App,
} from 'antd';
import {
  InstagramOutlined,
  CheckCircleFilled,
  DisconnectOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  ExclamationCircleFilled,
  LinkOutlined,
} from '@ant-design/icons';
import { useApiClient } from '@/services/useApiClient';
import type { NativeAccountStatus, NativeView } from './types';

const { Title, Text, Paragraph } = Typography;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ─── Feature list shown in the hero ─────────────────── */
const FEATURES = [
  { icon: '💬', label: 'Comment automation' },
  { icon: '✉️', label: 'Private replies' },
  { icon: '⚡', label: 'Messaging workflows' },
  { icon: '🔗', label: 'CRM integrations' },
];

/* ─── Status badge helpers ────────────────────────────── */
function WebhookBadge({ status }: { status: NativeAccountStatus['webhookStatus'] }) {
  if (status === 'active')
    return <Tag color="success" className="rounded-full m-0">✓ Webhook Active</Tag>;
  if (status === 'error')
    return <Tag color="error" className="rounded-full m-0">✕ Webhook Error</Tag>;
  return <Tag color="default" className="rounded-full m-0">○ Webhook Inactive</Tag>;
}

function AutomationBadge({ status }: { status: NativeAccountStatus['automationStatus'] }) {
  if (status === 'active')
    return <Tag color="purple" className="rounded-full m-0">⚡ Automation Active</Tag>;
  return <Tag color="default" className="rounded-full m-0">○ Automation Off</Tag>;
}

/* ─── Token expiry pill ───────────────────────────────── */
function TokenExpiry({ iso }: { iso?: string }) {
  if (!iso) return null;
  const days = Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days > 30) return null;

  return (
    <Alert
      showIcon
      icon={<ClockCircleOutlined />}
      type={days <= 7 ? 'error' : 'warning'}
      className="rounded-xl"
      message={
        days < 0
          ? 'Token has expired. Please reconnect.'
          : `Token expires in ${days} day${days !== 1 ? 's' : ''}`
      }
    />
  );
}

/* ─── ConnectedCard ───────────────────────────────────── */
function ConnectedCard({
  account,
  onConfigureAutomation,
  onDisconnect,
  onReconnect,
  isDisconnecting,
}: {
  account: NativeAccountStatus;
  onConfigureAutomation: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
  isDisconnecting: boolean;
}) {
  const connectedDate = account.connectedAt
    ? new Date(account.connectedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })
    : null;

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Instagram gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" />

      <div className="p-6 space-y-5">
        {/* Account identity */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <Avatar
              size={68}
              src={`https://ui-avatars.com/api/?name=${account.instagramUsername}&background=e0e7ff&color=4f46e5&bold=true`}
              className="border-2 border-indigo-100"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Text strong className="text-gray-900 text-base">
                @{account.instagramUsername}
              </Text>
              <Tag color="success" icon={<CheckCircleFilled />} className="m-0">
                Connected
              </Tag>
            </div>
            <Text type="secondary" className="text-xs">
              Instagram Business · ID: {account.instagramBusinessId}
            </Text>
            {connectedDate && (
              <Text type="secondary" className="text-xs block">
                Connected on {connectedDate}
              </Text>
            )}
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <WebhookBadge status={account.webhookStatus} />
          <AutomationBadge status={account.automationStatus} />
        </div>

        {/* Token expiry warning */}
        <TokenExpiry iso={account.tokenExpiresAt} />

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={onConfigureAutomation}
            className="h-10 rounded-xl font-medium"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
          >
            Configure Automation
          </Button>

          <Tooltip title="Reconnect to refresh your access token">
            <Button
              icon={<ReloadOutlined />}
              onClick={onReconnect}
              className="h-10 rounded-xl font-medium"
            >
              Reconnect Account
            </Button>
          </Tooltip>
        </div>

        <Popconfirm
          title="Disconnect Instagram?"
          description="This will remove the account, revoke tokens, and pause all automations."
          onConfirm={onDisconnect}
          okText="Disconnect"
          okButtonProps={{ danger: true }}
        >
          <Button
            block
            danger
            icon={<DisconnectOutlined />}
            loading={isDisconnecting}
            className="h-10 rounded-xl font-medium"
          >
            Disconnect Account
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
}

/* ─── HeroConnect – shown when no account is connected ── */
function HeroConnect({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0533] via-[#3d0b6b] to-[#1a0533] shadow-2xl p-10 text-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#833ab4] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#fd1d1d] opacity-15 blur-3xl" />

      {/* Icon */}
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-lg shadow-purple-900/40">
          <InstagramOutlined className="text-5xl text-white" />
        </div>
      </div>

      <Title level={2} className="!text-white !mb-3 text-center">
        Connect Instagram Business
      </Title>
      <Paragraph className="text-purple-200 text-center max-w-sm mx-auto !mb-8">
        Connect your Instagram business account to unlock:
      </Paragraph>

      {/* Feature list */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-10">
        {FEATURES.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-sm text-white"
          >
            <span className="text-base">{f.icon}</span>
            {f.label}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          type="primary"
          size="large"
          icon={<LinkOutlined />}
          onClick={onConnect}
          className="h-12 px-10 rounded-xl font-semibold text-base shadow-lg shadow-purple-900/50"
          style={{
            background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
            border: 'none',
          }}
        >
          Connect Instagram
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NativeConnectPage — main export
═══════════════════════════════════════════════════════ */
export default function NativeConnectPage({
  initialAccountId,
  initialStatus,
  initialError,
  onViewChange,
}: {
  initialAccountId?: string | null;
  initialStatus?: 'success' | 'error' | null;
  initialError?: string | null;
  onViewChange: (view: NativeView, accountId?: string) => void;
}) {
  const { message } = App.useApp();
  const api = useApiClient();

  const [accountId, setAccountId] = useState<string | null>(initialAccountId ?? null);
  const [accountStatus, setAccountStatus] = useState<NativeAccountStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [callbackHandled, setCallbackHandled] = useState(false);

  /* ── Load account status ──────────────────────────── */
  const loadAccountStatus = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        console.log('[NativeIG] GET account-status', id);
        const res = await api.get<NativeAccountStatus>(`/instagram/account-status/${id}`);
        console.log('[NativeIG] account-status response', res);
        setAccountStatus(res);
      } catch (err: any) {
        console.error('[NativeIG] Failed to load account status', err);
        const msg =
          err?.response?.data?.message || 'Failed to load account status.';
        message.error(msg);
        setAccountStatus(null);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /* ── Handle initial callback params ──────────────── */
  useEffect(() => {
    if (callbackHandled) return;
    setCallbackHandled(true);

    if (initialStatus === 'success' && initialAccountId) {
      message.success('Instagram account connected successfully!');
      setAccountId(initialAccountId);
      loadAccountStatus(initialAccountId);

      // Clean URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('status');
      url.searchParams.delete('accountId');
      window.history.replaceState({}, '', url.toString());

      // Auto-open automation screen
      setTimeout(() => {
        onViewChange('automation', initialAccountId);
      }, 1500);
    } else if (initialStatus === 'error') {
      message.error(
        initialError
          ? decodeURIComponent(initialError)
          : 'Instagram connection failed. Please try again.'
      );
    } else if (initialStatus === 'success' && !initialAccountId) {
      message.warning('Connection succeeded but account ID is missing. Please contact support.');
    } else if (accountId) {
      loadAccountStatus(accountId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Handlers ─────────────────────────────────────── */
  const handleConnect = () => {
    console.log('[NativeIG] Redirecting to business-login');
    window.location.href = `${API_URL}/instagram/native/business-login`;
  };

  const handleReconnect = () => {
    console.log('[NativeIG] Reconnecting…');
    window.location.href = `${API_URL}/instagram/native/business-login`;
  };

  const handleDisconnect = async () => {
    if (!accountId) return;
    setDisconnecting(true);
    try {
      console.log('[NativeIG] DELETE disconnect', accountId);
      await api.delete(`/instagram/native/disconnect/${accountId}`);
      message.success('Account disconnected successfully.');
      setAccountId(null);
      setAccountStatus(null);
    } catch (err: any) {
      console.error('[NativeIG] disconnect error', err);
      message.error(err?.response?.data?.message || 'Failed to disconnect account.');
    } finally {
      setDisconnecting(false);
    }
  };

  /* ── Render ───────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-lg animate-pulse">
          <InstagramOutlined className="text-3xl text-white" />
        </div>
        <Spin size="large" />
        <Text type="secondary">Loading your Instagram account…</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto" suppressHydrationWarning>

      {/* Page header */}
      <div>
        <Title level={3} className="!mb-1 flex items-center gap-3">
          <span className="inline-flex w-9 h-9 rounded-xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] items-center justify-center shadow">
            <InstagramOutlined className="text-white text-lg" />
          </span>
          Instagram Business
        </Title>
        <Text type="secondary">
          Native business login — powered by Meta&apos;s Business Login API
        </Text>
      </div>

      {/* Error banner */}
      {initialStatus === 'error' && (
        <Alert
          type="error"
          showIcon
          icon={<ExclamationCircleFilled />}
          message="Connection Failed"
          description={
            initialError
              ? decodeURIComponent(initialError)
              : 'Something went wrong during Instagram authorization. Please try again.'
          }
          className="rounded-2xl"
          action={
            <Button size="small" onClick={handleConnect}>
              Retry
            </Button>
          }
        />
      )}

      {/* Main content */}
      {accountStatus ? (
        <ConnectedCard
          account={accountStatus}
          onConfigureAutomation={() => onViewChange('automation', accountId!)}
          onDisconnect={handleDisconnect}
          onReconnect={handleReconnect}
          isDisconnecting={disconnecting}
        />
      ) : (
        <HeroConnect onConnect={handleConnect} />
      )}
    </div>
  );
}
