'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { App, Card, Typography, Spin, Avatar, Tag, Button } from 'antd';
import {
  InstagramOutlined,
  CheckCircleFilled,
  LoadingOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useApiClient } from '@/services/useApiClient';
import {
  AutomationTriggersPanel,
  AutomationStatusCard,
} from '@/modules/instagram/components/InstagramConnect';

const { Title, Text } = Typography;

/* ─── Types ───────────────────────────────────────────── */
interface InstagramAccount {
  id: string;
  username: string;
  profilePicture?: string;
  isSubscribed: boolean;
  instagramBusinessId?: string;
  createdAt: string;
}

/* ─── Loading card ─────────────────────────────────────── */
function LoadingCard({ label }: { label: string }) {
  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm text-center py-16">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
      <Text className="block mt-5 text-gray-400 text-sm tracking-wide">{label}</Text>
    </Card>
  );
}

/* ─── Error card ──────────────────────────────────────── */
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="rounded-2xl border border-red-100 bg-red-50/40 shadow-sm text-center py-12 space-y-4">
      <ExclamationCircleOutlined className="text-5xl text-red-400" />
      <div className="space-y-1">
        <Title level={5} className="!mb-0 text-red-600">Connection Failed</Title>
        <Text type="secondary" className="text-sm block max-w-sm mx-auto">{message}</Text>
      </div>
      <Button icon={<ReloadOutlined />} onClick={onRetry} className="rounded-xl mt-2">
        Retry
      </Button>
    </Card>
  );
}

/* ─── Account selection card ──────────────────────────── */
function AccountSelectionCard({
  accounts,
  onSelect,
}: {
  accounts: InstagramAccount[];
  onSelect: (acc: InstagramAccount) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Title level={4} className="!mb-0">Select Instagram Account</Title>
        <Text type="secondary" className="text-sm">
          Multiple accounts were found. Choose one to configure automations for.
        </Text>
      </div>
      <div className="space-y-3">
        {accounts.map(account => (
          <Card
            key={account.id}
            hoverable
            className="rounded-2xl border border-gray-100 hover:border-indigo-300 transition-all duration-200"
            onClick={() => onSelect(account)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar
                    size={56}
                    src={account.profilePicture ||
                      `https://ui-avatars.com/api/?name=${account.username}&background=e0e7ff&color=4f46e5&bold=true`}
                    icon={!account.profilePicture && <InstagramOutlined />}
                    className="border-2 border-indigo-100"
                  />
                  <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    account.isSubscribed ? 'bg-emerald-500' : 'bg-gray-300'
                  }`} />
                </div>
                <div>
                  <Text strong className="text-gray-900 text-base">@{account.username}</Text>
                  <Text type="secondary" className="block text-xs mt-0.5">
                    ID: {account.instagramBusinessId}
                  </Text>
                </div>
              </div>
              <Button type="primary" shape="round" size="small"
                style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d)', border: 'none' }}>
                Select
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Connected account card ─────────────────────────── */
function AccountConnectedCard({
  account,
  onConfigure,
}: {
  account: InstagramAccount;
  onConfigure: () => void;
}) {
  return (
    <div className="space-y-6">

      {/* Top gradient bar card */}
      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 w-full" style={{
          background: 'linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045)'
        }} />

        <div className="p-8 space-y-6">
          {/* Success header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircleFilled className="text-2xl text-emerald-500" />
            </div>
            <div>
              <Title level={4} className="!mb-0">Account Connected</Title>
              <Text type="secondary" className="text-sm">
                Your Instagram account is successfully linked to BrokerageX
              </Text>
            </div>
          </div>

          {/* Profile row */}
          <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="relative flex-shrink-0">
              <Avatar
                size={72}
                src={account.profilePicture ||
                  `https://ui-avatars.com/api/?name=${account.username}&background=e0e7ff&color=4f46e5&bold=true`}
                icon={!account.profilePicture && <InstagramOutlined />}
                className="border-3 border-white shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Title level={5} className="!mb-0 text-gray-900">@{account.username}</Title>
                <Tag color="success" icon={<CheckCircleFilled />} className="m-0 rounded-full font-medium">
                  Connected
                </Tag>
              </div>
              <Text type="secondary" className="text-xs mt-1 block">Instagram Business Account</Text>
              {account.instagramBusinessId && (
                <Text type="secondary" className="text-xs font-mono block mt-0.5">
                  ID: {account.instagramBusinessId}
                </Text>
              )}
            </div>
          </div>

          {/* Status pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: '✓ Instagram Connected', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { label: '✓ Webhook Active', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { label: '⏳ Automation Pending', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-center py-2.5 px-4 rounded-xl border text-sm font-medium ${item.color} ${item.bg} ${item.border}`}>
                {item.label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            onClick={onConfigure}
            className="w-full h-12 rounded-xl font-semibold text-base shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
          >
            Configure Automation
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Inner component (uses App.useApp hooks via parent App wrapper) ── */
function ConnectScreenInner() {
  const { message } = App.useApp();
  const router = useRouter();
  const api = useApiClient();

  type Step = 'loading' | 'select' | 'connected' | 'triggers' | 'status' | 'error';
  const [step, setStep] = useState<Step>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<InstagramAccount | null>(null);

  useEffect(() => {
    console.log('CALLBACK_RECEIVED');
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAccounts = async () => {
    setStep('loading');
    try {
      const result = await api.get('/instagram/accounts');
      const list: InstagramAccount[] = Array.isArray(result)
        ? result
        : (result?.data || []);

      if (list.length === 0) {
        setErrorMsg('No Instagram account was found after OAuth. Please try connecting again.');
        setStep('error');
        return;
      }

      if (list.length === 1) {
        console.log('ACCOUNT_CONNECTED', list[0]);
        setActiveAccount(list[0]);
        setStep('connected');
      } else {
        setAccounts(list);
        setStep('select');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load Instagram accounts.';
      setErrorMsg(msg);
      message.error(msg);
      setStep('error');
    }
  };

  const handleSelectAccount = (acc: InstagramAccount) => {
    console.log('ACCOUNT_CONNECTED', acc);
    setActiveAccount(acc);
    setStep('connected');
  };

  const handleConfigureClicked = () => {
    setStep('triggers');
  };

  const handleTriggersSaved = () => {
    console.log('WEBHOOK_ACTIVE');
    console.log('AUTOMATION_ACTIVE');
    setStep('status');
  };

  const handleFinished = () => {
    router.push('/instagram');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
          style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
          <InstagramOutlined className="text-xl text-white" />
        </div>
        <div>
          <Title level={4} className="!mb-0">Instagram Connector</Title>
          <Text type="secondary" className="text-xs">Post-authentication setup</Text>
        </div>
      </div>

      {step === 'loading' && (
        <LoadingCard label="Loading your connected Instagram account..." />
      )}

      {step === 'error' && (
        <ErrorCard message={errorMsg} onRetry={fetchAccounts} />
      )}

      {step === 'select' && (
        <AccountSelectionCard accounts={accounts} onSelect={handleSelectAccount} />
      )}

      {step === 'connected' && activeAccount && (
        <AccountConnectedCard account={activeAccount} onConfigure={handleConfigureClicked} />
      )}

      {/* Reuse existing trigger panel — no duplication */}
      {step === 'triggers' && activeAccount && (
        <Card className="rounded-2xl border border-gray-100 shadow-sm p-6">
          <AutomationTriggersPanel
            instagramBusinessId={activeAccount.instagramBusinessId || activeAccount.id}
            oauthSession=""
            onNext={handleTriggersSaved}
          />
        </Card>
      )}

      {/* Reuse existing status card — no duplication */}
      {step === 'status' && activeAccount && (
        <Card className="rounded-2xl border border-gray-100 shadow-sm p-6">
          <AutomationStatusCard
            accountId={activeAccount.id}
            onFinished={handleFinished}
          />
        </Card>
      )}
    </div>
  );
}

/* ─── Root export wrapped in App for antd hooks ──────── */
export default function InstagramConnectScreen() {
  return (
    <App>
      <Suspense fallback={<LoadingCard label="Loading..." />}>
        <ConnectScreenInner />
      </Suspense>
    </App>
  );
}
