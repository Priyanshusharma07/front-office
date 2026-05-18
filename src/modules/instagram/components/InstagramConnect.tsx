'use client';

import React, { useEffect, useState } from 'react';
import {
  Button, Avatar, Tag, Typography, Popconfirm,
  App, Skeleton, Alert, Tooltip, Card, Spin,
  Checkbox, Divider,
} from 'antd';
import {
  InstagramOutlined, CheckCircleFilled, ExclamationCircleFilled,
  DisconnectOutlined, ReloadOutlined, PlusOutlined,
  ClockCircleOutlined, CheckOutlined, FacebookOutlined,
  ArrowRightOutlined, SaveOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';

const { Title, Text, Paragraph } = Typography;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ─── Types ──────────────────────────────────────────── */
interface InstagramAccount {
  id: string;
  username: string;
  profilePicture?: string;
  isSubscribed: boolean;
  tokenExpiresAt?: string;
  createdAt: string;
  triggers?: string[];
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  instagramUsername?: string;
  picture?: { data: { url: string } };
}

interface AvailablePagesResponse {
  name: string;
  id: string;
  pages: FacebookPage[];
}

const TRIGGER_OPTIONS = [
  { key: 'comments', label: 'Comments', icon: '💬' },
  { key: 'messages', label: 'Messages', icon: '✉️' },
  { key: 'mentions', label: 'Mentions', icon: '@' },
  { key: 'posts', label: 'Posts', icon: '📸' },
];

const STEPS = [
  { n: 1, label: 'Connect Facebook' },
  { n: 2, label: 'Select Page' },
  { n: 3, label: 'Configure Triggers' },
  { n: 4, label: 'Go Live' },
];

/* ═══════════════════════════════════════════════════════
   FacebookPageCard
═══════════════════════════════════════════════════════ */
function FacebookPageCard({
  page,
  onSelect,
  isLoading,
}: {
  page: FacebookPage;
  onSelect: (page: FacebookPage) => void;
  isLoading: boolean;
}) {
  return (
    <Card
      hoverable
      className="rounded-2xl border-2 border-gray-100 hover:border-indigo-300 transition-all duration-200"
      onClick={() => !isLoading && onSelect(page)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            size={56}
            src={page.picture?.data?.url}
            icon={!page.picture?.data?.url && <FacebookOutlined />}
            className="bg-gradient-to-tr from-blue-500 to-indigo-600"
          />
          <div>
            <Title level={5} className="!mb-0">{page.name}</Title>
            <Text type="secondary" className="text-xs">{page.category}</Text>
            {page.instagramUsername && (
              <div className="mt-1">
                <Tag color="purple" className="rounded-full text-xs">
                  <InstagramOutlined className="mr-1" />
                  @{page.instagramUsername}
                </Tag>
              </div>
            )}
          </div>
        </div>
        {isLoading ? <Spin size="small" /> : <ArrowRightOutlined className="text-gray-400" />}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════
   TriggerConfig
═══════════════════════════════════════════════════════ */
function TriggerConfig({
  accountId,
  currentTriggers,
  oauthSession,
  onSaved,
}: {
  accountId: string;
  currentTriggers?: string[];
  oauthSession?: string;
  onSaved: () => void;
}) {
  const { message } = App.useApp();
  const api = useApiClient();
  const [selected, setSelected] = useState<string[]>(currentTriggers || []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      console.log('API REQUEST:', `${API_URL}/instagram/save-trigger`);
      return api.post('/instagram/save-trigger', { accountId, triggers: selected, oauthSession });
    },
    onSuccess: () => {
      console.log('TRIGGER SAVED:', { accountId, triggers: selected });
      message.success('Automation triggers saved!');
      onSaved();
    },
    onError: (err: any) => {
      message.error(err?.message || 'Failed to save triggers');
    },
  });

  const toggle = (key: string) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  return (
    <div className="space-y-4">
      <div>
        <Title level={5} className="!mb-1 flex items-center gap-2">
          <ThunderboltOutlined className="text-indigo-500" /> Automation Triggers
        </Title>
        <Text type="secondary" className="text-sm">
          Choose which events will trigger an automated private reply.
        </Text>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TRIGGER_OPTIONS.map(({ key, label, icon }) => (
          <div
            key={key}
            onClick={() => toggle(key)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150
              ${selected.includes(key)
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-100 hover:border-indigo-200'
              }`}
          >
            <Checkbox checked={selected.includes(key)} />
            <span className="text-base">{icon}</span>
            <Text className="font-medium text-sm">{label}</Text>
          </div>
        ))}
      </div>
      <Button
        type="primary"
        icon={<SaveOutlined />}
        loading={saveMutation.isPending}
        disabled={selected.length === 0}
        onClick={() => saveMutation.mutate()}
        className="w-full h-10 rounded-xl"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
      >
        Save Triggers
      </Button>
    </div>
  );
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
  onRefetch,
}: {
  account: InstagramAccount;
  onDisconnect: (id: string) => void;
  isDisconnecting: boolean;
  onVerify: (id: string) => void;
  isVerifying: boolean;
  onRefetch: () => void;
}) {
  const [showTriggers, setShowTriggers] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (account.tokenExpiresAt) {
      const days = Math.floor(
        (new Date(account.tokenExpiresAt).getTime() - Date.now()) / 86_400_000
      );
      setDaysLeft(days);
    }
  }, [account.tokenExpiresAt]);

  const expiringSoon = daysLeft !== null && daysLeft <= 7;

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Instagram gradient top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" />

      <div className="p-6 space-y-4">
        {/* Avatar + username */}
        <div className="flex items-center gap-4">
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

        {/* Trigger status */}
        {account.triggers && account.triggers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {account.triggers.map((t) => (
              <Tag key={t} color="purple" className="rounded-full text-xs m-0">
                {TRIGGER_OPTIONS.find((o) => o.key === t)?.label ?? t}
              </Tag>
            ))}
          </div>
        )}

        {/* Token expiry */}
        {expiringSoon && (
          <Alert
            type="warning"
            showIcon
            icon={<ClockCircleOutlined />}
            title={`Token expires in ${daysLeft} days`}
            description="Reconnect to refresh your access token."
            className="rounded-xl py-2"
          />
        )}

        {/* Trigger config toggle */}
        <Button
          block
          icon={<ThunderboltOutlined />}
          onClick={() => setShowTriggers((v) => !v)}
          className="rounded-xl"
        >
          {showTriggers ? 'Hide' : 'Configure'} Triggers
        </Button>

        {showTriggers && (
          <TriggerConfig
            accountId={account.id}
            currentTriggers={account.triggers}
            onSaved={() => { setShowTriggers(false); onRefetch(); }}
          />
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Tooltip title="Verify webhook subscription">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              loading={isVerifying}
              onClick={() => onVerify(account.id)}
              className="rounded-lg flex-1"
            >
              Verify
            </Button>
          </Tooltip>
          <Popconfirm
            title="Disconnect Instagram?"
            description="This will remove the account and pause all automations."
            onConfirm={() => onDisconnect(account.id)}
            okText="Disconnect"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              icon={<DisconnectOutlined />}
              loading={isDisconnecting}
              className="rounded-lg flex-1"
            >
              Disconnect
            </Button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EmptyState
═══════════════════════════════════════════════════════ */
function EmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-10 text-center">
      <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-lg">
        <InstagramOutlined className="text-4xl text-white" />
      </div>
      <Title level={4} className="!mb-2">Connect your Instagram Business account</Title>
      <Paragraph type="secondary" className="max-w-md mx-auto !mb-8">
        Link your Instagram Business profile so BrokerageX can listen for comments and automatically send private replies.
      </Paragraph>

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
        onClick={onConnect}
        style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', border: 'none' }}
        className="shadow-lg px-8"
      >
        Connect Instagram Account
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SelectedInstagramAccount  (TASK 5)
   Shown after user picks a page — displays IG info + triggers
═══════════════════════════════════════════════════════ */
interface SelectedAccount {
  id: string;
  username: string;
  profilePicture?: string;
  isSubscribed: boolean;
  name: string;
}

function SelectedInstagramAccount({
  account,
  oauthSession,
  onSaved,
}: {
  account: SelectedAccount;
  oauthSession: string;
  onSaved: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* ── Instagram account info ── */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <Avatar
              src={account.profilePicture || `https://ui-avatars.com/api/?name=${account.username}&background=e0e7ff&color=4f46e5&bold=true`}
              size={72}
              className="border-4 border-white shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center">
              <CheckCircleFilled className="text-white text-xs" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Text strong className="text-xl text-gray-900">@{account.username}</Text>
              <Tag color="success" icon={<CheckCircleFilled />} className="m-0">Connected</Tag>
            </div>
            <Text type="secondary" className="text-sm">{account.name}</Text>
            <div className="mt-1 flex items-center gap-1">
              <InstagramOutlined className="text-purple-500 text-xs" />
              <Text className="text-xs text-purple-600">Instagram Business Account</Text>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trigger configuration ── (TASK 6) */}
      <TriggerConfig
        accountId={account.id}
        oauthSession={oauthSession}
        onSaved={onSaved}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Facebook Pages Selector (TASKS 2, 3, 4, 5, 6, 7, 8)
   Shown when oauthSession is present in URL
═══════════════════════════════════════════════════════ */
function FacebookPageSelector({
  oauthSession,
  onSuccess,
}: {
  oauthSession: string;
  onSuccess: () => void;
}) {
  const { message } = App.useApp();
  const api = useApiClient();

  // ── TASK 2 state ──────────────────────────────────
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);

  // ── TASK 4 state ──────────────────────────────────
  const [selectingPageId, setSelectingPageId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<SelectedAccount | null>(null);

  // ── TASK 8 — log current URL and session on mount ──
  useEffect(() => {
    console.log('CURRENT URL:', window.location.href);
    console.log('OAUTH SESSION:', oauthSession);
  }, [oauthSession]);

  // ── TASK 2 — auto-load pages when oauthSession is present ──
  useEffect(() => {
    if (!oauthSession) return;
    loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oauthSession]);

  // ── TASK 2 — loadPages function ──────────────────
  async function loadPages() {
    setLoadingPages(true);
    setPagesError(null);
    try {
      const url = `/instagram/available-pages?oauthSession=${oauthSession}`;
      console.log('API REQUEST:', `${API_URL}${url}`);
      const response = await api.get<{ pages: FacebookPage[] }>(url);
      console.log('API RESPONSE:', response);
      console.log('PAGES:', response);
      setPages((response as any)?.pages ?? (Array.isArray(response) ? response : []));
    } catch (error: any) {
      console.log('PAGE_LOAD_ERROR:', error);
      const msg = error?.response?.data?.message || 'Could not load Facebook pages. The session may have expired.';
      setPagesError(msg);
    } finally {
      setLoadingPages(false);
    }
  }

  // ── TASK 4 — select account ───────────────────────
  async function handleSelectPage(page: FacebookPage) {
    setSelectingPageId(page.id);
    console.log('SELECTED PAGE:', { id: page.id, name: page.name });
    console.log('API REQUEST:', `${API_URL}/instagram/select-account`);
    try {
      const result = await api.post<SelectedAccount>('/instagram/select-account', {
        pageId: page.id,
        pageAccessToken: page.access_token,
        name: page.name,
        oauthSession,
      });
      console.log('API RESPONSE:', result);
      // Backend returns the newly created Instagram account record
      setSelectedAccount({
        id: (result as any)?.id ?? page.id,
        username: (result as any)?.username ?? page.name,
        profilePicture: (result as any)?.profilePicture,
        isSubscribed: (result as any)?.isSubscribed ?? false,
        name: page.name,
      });
      message.success('Instagram page linked! Now configure your triggers.');
      // Update URL cleanly — keep user on same page without oauthSession polluting the URL
      window.history.replaceState({}, '', '/integrations');
    } catch (error: any) {
      console.log('PAGE_LOAD_ERROR:', error);
      message.error(error?.response?.data?.message || 'Failed to connect page. Please try again.');
      setSelectingPageId(null);
    }
  }

  // ── TASK 7 — Loading state ────────────────────────
  if (loadingPages) {
    return (
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-10 text-center space-y-4">
        <Spin size="large" />
        <div>
          <Text strong className="block text-gray-700">Loading your Facebook pages…</Text>
          <Text type="secondary" className="text-sm">Fetching pages linked to your Meta account</Text>
        </div>
      </div>
    );
  }

  // ── TASK 7 — Error state ──────────────────────────
  if (pagesError) {
    return (
      <div className="space-y-4">
        <Alert
          type="error"
          showIcon
          title="Could not load Facebook pages"
          description={pagesError}
          className="rounded-2xl"
          action={
            <Button size="small" onClick={loadPages}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // ── TASK 5 — Show Instagram account after page selection ──
  if (selectedAccount) {
    return (
      <SelectedInstagramAccount
        account={selectedAccount}
        oauthSession={oauthSession}
        onSaved={onSuccess}
      />
    );
  }

  // ── TASK 3 — Render Facebook pages list ──────────
  return (
    <div className="space-y-4">
      {/* Instagram gradient banner */}
      <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" />

      <div>
        <Title level={4} className="!mb-1 flex items-center gap-2">
          <FacebookOutlined className="text-blue-600" /> Select a Facebook Page
        </Title>
        <Text type="secondary" className="text-sm">
          {pages.length > 0
            ? <>We found <strong>{pages.length}</strong> page{pages.length !== 1 ? 's' : ''} linked to your account. Choose the one connected to your Instagram Business profile.</>
            : 'No pages found. Retrying…'
          }
        </Text>
      </div>

      {/* TASK 7 — No pages empty state */}
      {pages.length === 0 ? (
        <div className="space-y-4">
          <Alert
            type="warning"
            showIcon
            title="No Facebook pages found"
            description="Make sure your Instagram account is a Business Account linked to a Facebook Page, then reconnect."
            className="rounded-2xl"
          />
          <Button block onClick={loadPages} icon={<ReloadOutlined />} className="rounded-xl">
            Reload Pages
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {pages.map((page) => (
            <FacebookPageCard
              key={page.id}
              page={page}
              onSelect={handleSelectPage}
              isLoading={selectingPageId === page.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════ */
export default function InstagramConnect({ oauthSession }: { oauthSession?: string | null }) {
  const { message } = App.useApp();
  const api = useApiClient();
  const queryClient = useQueryClient();

  // ── Fetch connected accounts (TASK 9) ──────────────
  const {
    data: accounts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<InstagramAccount[]>({
    queryKey: ['instagram-accounts'],
    queryFn: async () => {
      console.log('REQUEST URL:', `${API_URL}/instagram/accounts`);
      const result = await api.get<any>('/instagram/accounts');
      console.log('RESPONSE:', result);
      
      // Standardize extracting the list (handles direct array or unified response wrap)
      const accountsList: InstagramAccount[] = Array.isArray(result) 
        ? result 
        : (result?.data || []);
        
      console.log('MAPPED STATE:', accountsList.map((a) => ({ id: a.id, username: a.username, isSubscribed: a.isSubscribed })));
      console.log('RENDERED UI STATE:', accountsList.length > 0 ? 'Connected Accounts List' : 'No Instagram account connected');
      return accountsList;
    },
    retry: 1,
    staleTime: 30_000,
  });

  // ── Disconnect ────────────────────────────────────
  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('REQUEST URL:', `${API_URL}/instagram/accounts/${id}`);
      return api.delete(`/instagram/accounts/${id}`);
    },
    onSuccess: () => {
      message.success('Account disconnected.');
      queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] });
    },
    onError: () => message.error('Failed to disconnect. Try again.'),
  });

  // ── Verify webhook ────────────────────────────────
  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('REQUEST URL:', `${API_URL}/instagram/verify-subscription/${id}`);
      return api.get(`/instagram/verify-subscription/${id}`);
    },
    onSuccess: (data: any) => {
      if (data?.isSubscribed) {
        message.success('Webhook subscription verified!');
      } else {
        message.warning('Webhook not active. Please reconnect.');
      }
      queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] });
    },
    onError: () => message.error('Failed to verify subscription status.'),
  });

  // ── Connect Instagram (TASK 2) ────────────────────
  const connectInstagram = async () => {
    console.log('========== INSTAGRAM CONNECT ==========');
    console.log('BUTTON CLICKED');
    console.log('API_URL:', `${API_URL}/instagram/connect`);
    try {
      const response = await fetch(`${API_URL}/instagram/connect`, { redirect: 'manual' });
      console.log('RESPONSE:', response);
      console.log('FINAL_URL:', response.url);
      // Backend redirects browser to Meta — follow the redirect
      window.location.href = `${API_URL}/instagram/connect`;
    } catch (error) {
      console.log('CONNECT ERROR:', error);
      window.location.href = `${API_URL}/instagram/connect`;
    }
    console.log('=======================================');
  };

  const justConnected = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('connected') === 'true'
    : false;

  return (
    <div className="space-y-8 max-w-5xl mx-auto" suppressHydrationWarning>

      {/* ── Success Banner (post page-selection) ── */}
      {justConnected && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleFilled />}
          title="Instagram account connected!"
          description="Your account is now active. Configure your automation triggers below."
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
          onClick={connectInstagram}
          style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', border: 'none' }}
          className="shadow-md flex-shrink-0"
        >
          Connect Account
        </Button>
      </div>

      {/* ── TASK 5 & 6 — Facebook page selector (shown when oauthSession is present) ── */}
      {oauthSession && (
        <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm p-6">
          <FacebookPageSelector
            oauthSession={oauthSession}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] });
            }}
          />
        </div>
      )}

      {/* ── Required Permissions checklist ── */}
      {!oauthSession && (
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
      )}

      {/* ── TASK 9 — Account list ── */}
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
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
          className="rounded-2xl"
        />
      ) : accounts.length === 0 && !oauthSession ? (
        <div className="space-y-6">
          <Alert
            type="info"
            showIcon
            title="No Instagram account connected"
            description="Link your Instagram Business account to enable automatic private replies."
            className="rounded-2xl shadow-sm"
          />
          <EmptyState onConnect={connectInstagram} />
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onDisconnect={disconnectMutation.mutate}
              isDisconnecting={disconnectMutation.isPending}
              onVerify={verifyMutation.mutate}
              isVerifying={verifyMutation.isPending && verifyMutation.variables === account.id}
              onRefetch={() => queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] })}
            />
          ))}

          {/* Add another */}
          <button
            onClick={connectInstagram}
            className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 flex flex-col items-center justify-center gap-3 p-8 text-gray-400 hover:text-indigo-500 cursor-pointer min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
              <PlusOutlined className="text-xl" />
            </div>
            <Text className="text-sm font-medium text-current">Add Another Account</Text>
          </button>
        </div>
      ) : null}
    </div>
  );
}
