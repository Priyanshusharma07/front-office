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

const triggerFieldMap: Record<string, string> = {
  comments: 'feed',
  posts: 'feed',
  messages: 'messages',
  mentions: 'mention',
};

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
   Onboarding Flow Sub-Components
   (TASKS 1, 2, 3, 4, 5, 6, 7)
   ═══════════════════════════════════════════════════════ */

interface SelectedAccount {
  instagramBusinessId: string;
  username: string;
  profilePicture: string | null;
  pageId: string;
}

// ── TASK 5: Automation Triggers Onboarding Panel ────
function AutomationTriggersPanel({
  instagramBusinessId,
  oauthSession,
  onNext,
}: {
  instagramBusinessId: string;
  oauthSession: string;
  onNext: () => void;
}) {
  const { message } = App.useApp();
  const api = useApiClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (key: string) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const handleSave = async () => {
    if (selected.length === 0) {
      message.warning('Please select at least one trigger to configure.');
      return;
    }
    setSaving(true);
    try {
      // Loop over and save each selected trigger type
      for (const triggerType of selected) {
        const body = {
          instagramBusinessId,
          triggerType,
          webhookField: triggerFieldMap[triggerType],
          automationId: `auto_${triggerType}_${Date.now()}`,
        };
        console.log('API REQUEST:', `${API_URL}/instagram/save-trigger`, body);
        const res = await api.post('/instagram/save-trigger', body);
        console.log('TRIGGER SAVED:', res);
      }
      message.success('Automation triggers saved successfully!');
      onNext();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to save automation triggers.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1 flex items-center gap-2">
          <ThunderboltOutlined className="text-indigo-500" /> Configure Automation Triggers
        </Title>
        <Text type="secondary" className="text-sm">
          Choose which Instagram events will trigger automated private replies.
        </Text>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {TRIGGER_OPTIONS.map(({ key, label, icon }) => (
          <div
            key={key}
            onClick={() => toggle(key)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 shadow-sm
              ${selected.includes(key)
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-gray-100 bg-white hover:border-indigo-200'
              }`}
          >
            <Checkbox checked={selected.includes(key)} />
            <span className="text-2xl">{icon}</span>
            <div>
              <Text className="font-semibold text-sm block">{label}</Text>
              <Text type="secondary" className="text-xs">Trigger on new {label.toLowerCase()}</Text>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="primary"
        size="large"
        icon={<SaveOutlined />}
        loading={saving}
        disabled={selected.length === 0}
        onClick={handleSave}
        className="w-full h-12 rounded-xl font-medium shadow-md"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
      >
        Save and Enable Automation
      </Button>
    </div>
  );
}

// ── TASK 6: Live Automation Status Check Card ────────
function AutomationStatusCard({
  accountId,
  onFinished,
}: {
  accountId: string;
  onFinished: () => void;
}) {
  const api = useApiClient();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        console.log('API REQUEST:', `${API_URL}/instagram/automation-status/${accountId}`);
        const res = await api.get<any>(`/instagram/automation-status/${accountId}`);
        console.log('AUTOMATION STATUS:', res);
        
        const data = res?.data || res;
        setStatus(data);
        
        console.log('SELECTED_TRIGGER:', data?.triggerType);
        console.log('MAPPED_FIELD:', data?.webhookField);
        console.log('AUTOMATION_STATUS:', data?.automationActive);
        console.log('WEBHOOK_STATUS:', data?.webhookSubscribed);
      } catch (err) {
        console.error('Failed to load automation status:', err);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <Spin size="large" />
        <Text type="secondary" className="block text-sm">Verifying live server configuration status...</Text>
      </div>
    );
  }

  const checklist = [
    { label: 'Instagram Connected', active: status?.connected },
    { label: 'Webhook Active', active: status?.webhookSubscribed },
    { label: 'Trigger Configured', active: status?.triggerConfigured },
    { label: 'Automation Active', active: status?.automationActive },
    { label: 'Active Webhook Fields', active: status?.webhookSubscribed },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckOutlined className="text-2xl" />
        </div>
        <Title level={4} className="!mb-0">Onboarding Completed Successfully!</Title>
        <Text type="secondary" className="text-sm block">Your automated private reply channel is now live on Instagram.</Text>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 space-y-3">
        {checklist.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-700 font-medium">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${item.active ? 'text-emerald-600' : 'text-gray-400'}`}>
                {item.active ? '✓ Active' : '✕ Inactive'}
              </span>
              {item.active ? (
                <CheckCircleFilled className="text-emerald-500" />
              ) : (
                <ExclamationCircleFilled className="text-gray-300" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mt-6 text-xs font-mono text-gray-600">
        <div className="font-bold text-gray-800 mb-2">Developer Diagnostics</div>
        <div>Instagram Account: {status?.username || 'N/A'}</div>
        <div>Business ID: {status?.instagramBusinessId || 'N/A'}</div>
        <div>Selected Trigger: {status?.triggerType || 'N/A'}</div>
        <div>Mapped Webhook Field: {status?.webhookField || 'N/A'}</div>
        <div>Webhook Status: {status?.webhookSubscribed ? 'Active' : 'Inactive'}</div>
        <div>Automation Status: {status?.automationActive ? 'Active' : 'Inactive'}</div>
      </div>

      <Button
        type="primary"
        size="large"
        onClick={onFinished}
        className="w-full h-12 rounded-xl font-medium shadow-md"
        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
      >
        Finish and View Dashboard
      </Button>
    </div>
  );
}

// ── TASK 8 — Complete Pages Selector Wizard ─────────
function FacebookPageSelector({
  oauthSession,
  onSuccess,
}: {
  oauthSession: string;
  onSuccess: () => void;
}) {
  const { message } = App.useApp();
  const api = useApiClient();

  // Onboarding wizard steps: 'pages' | 'found' | 'connected' | 'triggers' | 'status'
  const [step, setStep] = useState<'pages' | 'found' | 'connected' | 'triggers' | 'status'>('pages');

  // Available pages data
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);

  // Connection flow selections/responses
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [selectingPageId, setSelectingPageId] = useState<string | null>(null);
  const [instagramAccount, setInstagramAccount] = useState<SelectedAccount | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [webhookSubscribed, setWebhookSubscribed] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string>('');

  // ── TASK 7 — Log current URL and session on mount ──
  useEffect(() => {
    console.log('CURRENT URL:', window.location.href);
    console.log('OAUTH SESSION:', oauthSession);
  }, [oauthSession]);

  // ── TASK 1 — Auto-load pages on mount ──
  useEffect(() => {
    if (!oauthSession) return;
    loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oauthSession]);

  async function loadPages() {
    setLoadingPages(true);
    setPagesError(null);
    try {
      const url = `/instagram/available-pages?oauthSession=${oauthSession}`;
      console.log('API REQUEST:', `${API_URL}${url}`);
      const response = await api.get<any>(url);
      console.log('API RESPONSE:', response);
      
      const pagesList = response?.pages || (Array.isArray(response) ? response : []);
      console.log('PAGES:', pagesList);
      setPages(pagesList);
    } catch (error: any) {
      console.log('PAGE_LOAD_ERROR:', error);
      const msg = error?.response?.data?.message || 'Could not load Facebook pages. The session may have expired.';
      setPagesError(msg);
    } finally {
      setLoadingPages(false);
    }
  }

  // ── TASK 2 — Select page and retrieve IG Business details ──
  const handleSelectPage = async (page: FacebookPage) => {
    setSelectingPageId(page.id);
    setSelectedPage(page);
    console.log('SELECTED PAGE:', { id: page.id, name: page.name });
    console.log('API REQUEST:', `${API_URL}/instagram/select-account`);
    try {
      const result = await api.post<any>('/instagram/select-account', {
        pageId: page.id,
        pageAccessToken: page.access_token,
      });
      console.log('INSTAGRAM RESPONSE:', result);

      if (result?.instagram) {
        setInstagramAccount(result.instagram);
        setStep('found');
      } else {
        throw new Error('No Instagram account returned');
      }
    } catch (error: any) {
      console.log('PAGE_LOAD_ERROR:', error);
      message.error(error?.response?.data?.message || 'No linked Instagram Business Account found for this Facebook page.');
      setSelectingPageId(null);
    }
  };

  // ── TASK 3 — Connect account to DB and activate Webhook ──
  const handleConnectAccount = async () => {
    if (!selectedPage || !instagramAccount) return;
    setConnecting(true);
    console.log('API REQUEST:', `${API_URL}/instagram/connect-account`);
    try {
      const body = {
        pageId: selectedPage.id,
        pageAccessToken: selectedPage.access_token,
        instagramBusinessId: instagramAccount.instagramBusinessId,
        username: instagramAccount.username,
      };
      const result = await api.post<any>('/instagram/connect-account', body);
      console.log('CONNECT ACCOUNT RESPONSE:', result);
      console.log('WEBHOOK STATUS:', result?.webhookSubscribed ? 'Active' : 'Failed');

      setWebhookSubscribed(!!result?.webhookSubscribed);
      setStep('connected');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to connect Instagram account.');
    } finally {
      setConnecting(false);
    }
  };

  // ── TASK 7 — Render steps ────────────────────────
  if (loadingPages) {
    return (
      <div className="p-12 text-center space-y-4 bg-gray-50/50 rounded-2xl border border-gray-100">
        <Spin size="large" />
        <div>
          <Text strong className="block text-gray-700">Loading your Facebook pages…</Text>
          <Text type="secondary" className="text-xs">Fetching profiles linked to your Meta account</Text>
        </div>
      </div>
    );
  }

  if (pagesError) {
    return (
      <div className="space-y-4">
        <Alert
          type="error"
          showIcon
          title="Could not load Facebook pages"
          description={pagesError}
          className="rounded-2xl"
        />
        <Button block onClick={loadPages} className="rounded-xl h-11 font-medium">
          Retry Loading Pages
        </Button>
      </div>
    );
  }

  // STEP 1 — Available Pages List
  if (step === 'pages') {
    return (
      <div className="space-y-6">
        <div>
          <Title level={4} className="!mb-1 flex items-center gap-2">
            <FacebookOutlined className="text-blue-600" /> Available Facebook Pages
          </Title>
          <Text type="secondary" className="text-sm block">
            We found <strong>{pages.length}</strong> page{pages.length !== 1 ? 's' : ''} linked to your Meta profile. Choose the one connected to your Instagram account.
          </Text>
        </div>

        {pages.length === 0 ? (
          <div className="space-y-4">
            <Alert
              type="warning"
              showIcon
              title="No Facebook pages detected"
              description="Ensure your page is linked to a professional Instagram Business profile in Meta Business Suite."
              className="rounded-2xl"
            />
            <Button block onClick={loadPages} icon={<ReloadOutlined />} className="rounded-xl h-11">
              Reload Pages
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
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

  // STEP 2 — Instagram Account Found Preview
  if (step === 'found' && instagramAccount) {
    return (
      <div className="space-y-6">
        <div>
          <Title level={4} className="!mb-1 flex items-center gap-2 text-indigo-600">
            <InstagramOutlined /> Instagram Account Found
          </Title>
          <Text type="secondary" className="text-sm">
            Verify the linked Instagram Business account details before proceeding.
          </Text>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 flex items-center gap-4">
          <Avatar
            src={instagramAccount.profilePicture || `https://ui-avatars.com/api/?name=${instagramAccount.username}&background=e0e7ff&color=4f46e5&bold=true`}
            size={72}
            className="border-4 border-white shadow-md flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <Text strong className="text-lg text-gray-900">@{instagramAccount.username}</Text>
              <Tag color="purple" className="m-0 font-medium">✓ Professional Status</Tag>
            </div>
            <Text type="secondary" className="text-xs block mt-0.5">IG ID: {instagramAccount.instagramBusinessId}</Text>
            <Text className="text-xs text-emerald-600 font-semibold mt-1 block">✓ Ready to Connect</Text>
          </div>
        </div>

        <Button
          type="primary"
          size="large"
          loading={connecting}
          onClick={handleConnectAccount}
          className="w-full h-12 rounded-xl font-medium shadow-md"
          style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d)', border: 'none' }}
        >
          Connect Account
        </Button>
      </div>
    );
  }

  // STEP 3 — Connected success state
  if (step === 'connected') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircleFilled className="text-3xl" />
          </div>
          <Title level={4} className="!mb-0 text-emerald-600">Instagram Connected</Title>
          <Text type="secondary" className="text-sm block">Successfully authorized and registered your account.</Text>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Text className="font-semibold text-gray-700">Connection Status</Text>
            <Tag color="success" className="font-medium rounded-full px-3">✓ Complete</Tag>
          </div>
          <div className="flex items-center justify-between">
            <Text className="font-semibold text-gray-700">Webhook Status</Text>
            <Tag color={webhookSubscribed ? 'success' : 'warning'} className="font-medium rounded-full px-3">
              {webhookSubscribed ? '✓ Active' : '✕ Inactive'}
            </Tag>
          </div>
        </div>

        <Button
          type="primary"
          size="large"
          onClick={() => setStep('triggers')}
          className="w-full h-12 rounded-xl font-medium shadow-md"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #4f46e5)', border: 'none' }}
        >
          Proceed to Triggers
        </Button>
      </div>
    );
  }

  // STEP 4 — Trigger configuration panel
  if (step === 'triggers' && instagramAccount) {
    return (
      <AutomationTriggersPanel
        instagramBusinessId={instagramAccount.instagramBusinessId}
        oauthSession={oauthSession}
        onNext={async () => {
          // Find connected account DB ID to call verification endpoint
          try {
            const list = await api.get<any>('/instagram/accounts');
            const arr = Array.isArray(list) ? list : (list?.data || []);
            const matched = arr.find((a: any) => a.instagramBusinessId === instagramAccount.instagramBusinessId);
            if (matched) {
              setConnectedAccountId(matched.id);
            }
          } catch (e) {
            console.error('Failed to locate saved account id', e);
          }
          setStep('status');
        }}
      />
    );
  }

  // STEP 5 — Live Status Check Checklist
  if (step === 'status') {
    return (
      <AutomationStatusCard
        accountId={connectedAccountId}
        onFinished={() => {
          // Clear query params clean redirect and complete success parent trigger
          window.history.replaceState({}, '', '/integrations');
          onSuccess();
        }}
      />
    );
  }

  return null;
}

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */
export default function InstagramConnect({ oauthSession }: { oauthSession?: string | null }) {
  const { message } = App.useApp();
  const api = useApiClient();
  const queryClient = useQueryClient();

  // ── Fetch connected accounts ──────────────
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

  // ── Connect Instagram ────────────────────
  const connectInstagram = async () => {
    console.log('========== INSTAGRAM CONNECT ==========');
    console.log('BUTTON CLICKED');
    console.log('API_URL:', `${API_URL}/instagram/connect`);
    try {
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

      {/* ── Facebook page selector wizard (shown when oauthSession is present) ── */}
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

