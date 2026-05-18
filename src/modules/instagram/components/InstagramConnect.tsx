'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Button, Avatar, Tag, Typography, Popconfirm,
  App, Skeleton, Alert, Tooltip,
} from 'antd';
import {
  InstagramOutlined, CheckCircleFilled, ExclamationCircleFilled,
  DisconnectOutlined, ReloadOutlined, PlusOutlined,
  ClockCircleOutlined, CheckOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

/* ─── types ─────────────────────────────────────────── */
interface InstagramAccount {
  id: string;
  username: string;
  profilePicture?: string;
  isSubscribed: boolean;
  tokenExpiresAt?: string;
  createdAt: string;
}

/* ─── API helpers (no Clerk — uses mock token for now) ─ */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchAccounts(): Promise<InstagramAccount[]> {
  const { data } = await axios.get(`${API}/instagram/accounts`, {
    headers: { Authorization: `Bearer mock_token` },
  });
  return Array.isArray(data) ? data : [];
}


async function disconnectAccount(id: string): Promise<void> {
  await axios.delete(`${API}/instagram/accounts/${id}`, {
    headers: { Authorization: `Bearer mock_token` },
  });
}

async function verifySubscription(id: string): Promise<any> {
  const { data } = await axios.get(`${API}/instagram/verify-subscription/${id}`, {
    headers: { Authorization: `Bearer mock_token` },
  });
  return data;
}

/* ─── redirect to backend OAuth ──────────────────────── */
function startConnect() {
  window.location.href = `${API}/instagram/connect`;
}

/* ═══════════════════════════════════════════════════════
   AccountCard
═══════════════════════════════════════════════════════ */
function AccountCard({
  account,
  onDisconnect,
  isDisconnecting,
  onVerify,
  isVerifying,
}: {
  account: InstagramAccount;
  onDisconnect: (id: string) => void;
  isDisconnecting: boolean;
  onVerify: (id: string) => void;
  isVerifying: boolean;
}) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (account.tokenExpiresAt) {
      const days = Math.floor((new Date(account.tokenExpiresAt).getTime() - Date.now()) / 86_400_000);
      setDaysLeft(days);
    }
  }, [account.tokenExpiresAt]);

  const expiringSoon = daysLeft !== null && daysLeft <= 7;

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Instagram gradient top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" />

      <div className="p-6">
        {/* Avatar + username */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <Avatar
              src={account.profilePicture || `https://ui-avatars.com/api/?name=${account.username}&background=e0e7ff&color=4f46e5&bold=true`}
              size={60}
              className="border-2 border-indigo-100"
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${account.isSubscribed ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Text strong className="text-gray-900 text-base truncate">@{account.username}</Text>
              {account.isSubscribed
                ? <Tag color="success" icon={<CheckCircleFilled />} className="m-0">Active</Tag>
                : <Tag color="default" icon={<ExclamationCircleFilled />} className="m-0">Inactive</Tag>}
            </div>
            <Text type="secondary" className="text-xs">Instagram Business Account</Text>
          </div>
        </div>

        {/* Token expiry warning */}
        {expiringSoon && (
          <Alert
            className="mb-4 rounded-xl text-xs py-2"
            icon={<ClockCircleOutlined />}
            showIcon
            type={daysLeft! <= 0 ? 'error' : 'warning'}
            title={
              daysLeft! <= 0
                ? 'Token expired — reconnect to resume automations.'
                : `Token expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`
            }
          />
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-5 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Webhooks</span>
            <Tooltip title="Verify if your webhooks are active on Meta's servers">
              <Button 
                type="text" 
                size="small" 
                icon={<ReloadOutlined className={isVerifying ? 'animate-spin' : ''} />} 
                onClick={() => onVerify(account.id)}
                className="h-6 w-6 p-0 flex items-center justify-center text-gray-400 hover:text-indigo-600"
                disabled={isVerifying}
              />
            </Tooltip>
          </div>
          <span className={account.isSubscribed ? 'text-emerald-600 font-semibold' : ''}>
            {account.isSubscribed ? '✓ Subscribed' : 'Not subscribed'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Popconfirm
            title="Disconnect account?"
            description="All automations for this account will pause."
            okText="Disconnect"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDisconnect(account.id)}
          >
            <Button
              danger
              size="small"
              icon={<DisconnectOutlined />}
              loading={isDisconnecting}
              className="flex-1"
            >
              Disconnect
            </Button>
          </Popconfirm>

          {(!account.isSubscribed || expiringSoon) && (
            <Button
              type="primary"
              size="small"
              icon={<ReloadOutlined />}
              onClick={startConnect}
              className="flex-1"
            >
              Reconnect
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Empty / Onboarding State
═══════════════════════════════════════════════════════ */
const STEPS = [
  { n: '1', label: 'Click "Connect Account"' },
  { n: '2', label: 'Log in with Facebook/Instagram' },
  { n: '3', label: 'Approve the requested permissions' },
  { n: '4', label: "You're live — start automating!" },
];

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-10 text-center">
      {/* Icon */}
      <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-lg">
        <InstagramOutlined className="text-4xl text-white" />
      </div>

      <Title level={4} className="!mb-2">Connect your Instagram Business account</Title>
      <Paragraph type="secondary" className="max-w-md mx-auto !mb-8">
        Link your Instagram Business profile so BrokerageX can listen for comments
        and automatically send private replies.
      </Paragraph>

      {/* Steps */}
      <div className="flex justify-center gap-6 flex-wrap mb-8">
        {STEPS.map(({ n, label }) => (
          <div key={n} className="flex flex-col items-center gap-2 max-w-[100px]">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow">
              {n}
            </div>
            <Text className="text-xs text-gray-500 text-center leading-snug">{label}</Text>
          </div>
        ))}
      </div>

      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        onClick={startConnect}
        style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', border: 'none' }}
        className="shadow-lg px-8"
      >
        Connect Instagram Account
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════ */
export default function InstagramConnect() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const justConnected = searchParams.get('connected') === 'true';

  // When redirected back from page selection, force-refetch so the new account appears
  useEffect(() => {
    if (justConnected) {
      queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] });
    }
  }, [justConnected, queryClient]);

  const { data: accounts = [], isLoading, isError } = useQuery<InstagramAccount[]>({
    queryKey: ['instagram-accounts'],
    queryFn: fetchAccounts,
    retry: 1,
    staleTime: 30_000,
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectAccount,
    onSuccess: () => {
      message.success('Account disconnected.');
      queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] });
    },
    onError: () => message.error('Failed to disconnect. Try again.'),
  });

  const verifyMutation = useMutation({
    mutationFn: verifySubscription,
    onSuccess: (data) => {
      if (data.isSubscribed) {
        message.success('Webhook subscription verified!');
      } else {
        message.warning('Webhook not active. Please reconnect.');
      }
      queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] });
    },
    onError: () => message.error('Failed to verify subscription status.'),
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto" suppressHydrationWarning>
      {/* ── Success Banner (shown right after connecting) ── */}
      {justConnected && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleFilled />}
          title="Instagram account connected!"
          description="Your account is now active. Automations will trigger on incoming comments."
          className="rounded-2xl"
          closable
        />
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={3} className="!mb-1 flex items-center gap-3">
            Instagram Integrations
            {!isLoading && accounts.length > 0 && (
              <Tag color="success" className="rounded-full px-3 m-0 flex items-center gap-1">
                <CheckCircleFilled className="text-xs" />
                {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'} Connected
              </Tag>
            )}
          </Title>
          <Paragraph type="secondary" className="!mb-0">
            Connect Instagram Business accounts to enable automated comment replies.
          </Paragraph>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={startConnect}
          style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', border: 'none' }}
          className="shadow-md flex-shrink-0"
        >
          Connect Account
        </Button>
      </div>

      {/* ── Permission checklist (always visible) ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <Text strong className="text-gray-700 block mb-3 text-sm uppercase tracking-wide">
          Required Permissions
        </Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'instagram_basic',
            'instagram_manage_comments',
            'instagram_manage_messages',
            'pages_show_list',
            'pages_read_engagement',
          ].map((perm) => (
            <div key={perm} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckOutlined className="text-emerald-500 text-xs" />
              <code className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{perm}</code>
            </div>
          ))}
        </div>
      </div>

      {/* ── Account list ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6">
              <Skeleton avatar active paragraph={{ rows: 3 }} />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Alert
          type="warning"
          showIcon
          title="Could not load connected accounts"
          description="The backend may be offline, or you haven't connected any accounts yet."
          action={
            <Button size="small" onClick={() => queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] })}>
              Retry
            </Button>
          }
          className="rounded-2xl"
        />
      ) : accounts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onDisconnect={disconnectMutation.mutate}
              isDisconnecting={disconnectMutation.isPending}
              onVerify={verifyMutation.mutate}
              isVerifying={verifyMutation.isPending && verifyMutation.variables === account.id}
            />
          ))}

          {/* ── Add another ── */}
          <button
            onClick={startConnect}
            className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 flex flex-col items-center justify-center gap-3 p-8 text-gray-400 hover:text-indigo-500 cursor-pointer min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
              <PlusOutlined className="text-xl" />
            </div>
            <Text className="text-sm font-medium text-current">Add Another Account</Text>
          </button>
        </div>
      )}
    </div>
  );
}
