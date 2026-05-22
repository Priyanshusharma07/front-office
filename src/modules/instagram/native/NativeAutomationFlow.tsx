'use client';

import React, { useEffect, useState } from 'react';
import {
  Tabs, Typography, Alert, Button, App, notification, Drawer,
} from 'antd';
import {
  PictureOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  SettingOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  useNativeAccount,
  getPersistedAccountId,
  persistAccountId,
  clearPersistedAccountId,
} from './hooks/useNativeAccount';
import { useSocket } from '@/modules/websocket/SocketProvider';
import { AccountStatusCard, AccountStatusCardSkeleton } from './components/AccountStatusCard';
import { PostsGrid } from './components/PostsGrid';
import { AutomationFormTab } from './components/AutomationFormTab';
import { WebhookEventsTable } from './components/WebhookEventsTable';
import { CommentsTab } from './components/CommentsTab';
import { SettingsTab } from './components/SettingsTab';
import { LoadingState } from './components/LoadingState';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useNativePosts } from './hooks/useNativePosts';


const { Title } = Typography;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ActiveTab = 'posts' | 'automation' | 'webhooks' | 'settings';


/* ═══════════════════════════════════════════════════════
   NativeAutomationFlow — orchestrator for the
   /instagram/native/automation page
═══════════════════════════════════════════════════════ */
export function NativeAutomationFlow() {
  const { message: antMessage } = App.useApp();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState<ActiveTab>('posts');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  /* ── accountId: initialised from localStorage & OAuth callback ─────── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const cbId = params.get('accountId');

    if (status === 'success' && cbId) {
      persistAccountId(cbId);
      setAccountId(cbId);
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      const id = getPersistedAccountId();
      if (id && !accountId) {
        setAccountId(id);
      }
    }
  }, []);

  /* ── Account status ──────────────────────────────── */
  const {
    accountStatus,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
    disconnect,
    isDisconnecting,
  } = useNativeAccount({ accountId });

  /* ── Sync accountId from resolved account data ───── */
  useEffect(() => {
    const id = accountStatus?.account?.id;
    if (id) {
      setAccountId(id);
      persistAccountId(id);
    }
  }, [accountStatus]);

  /* ── Posts (shared between Posts tab) ─────────────── */
  const {
    posts,
    isLoading: postsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: postsError,
  } = useNativePosts(accountStatus?.account?.id);

  /* ── WebSocket: real-time Instagram events ────────── */
  useEffect(() => {
    if (!socket) return;

    const handleNewEvent = (data: any) => {
      notification.info({
        message: 'New Instagram Event',
        description: data?.commentText
          ? `New comment from @${data.username}: "${data.commentText}"`
          : `New ${data?.eventType ?? 'event'} received`,
        placement: 'topRight',
        duration: 6,
      });
    };

    const handleAutoReply = (data: any) => {
      notification.success({
        message: 'Auto Reply Sent',
        description: `Replied to @${data?.username ?? 'user'} automatically.`,
        placement: 'topRight',
        duration: 5,
      });
    };

    const handleSubscriptionUpdate = (data: any) => {
      notification.success({
        message: 'Webhook Updated',
        description: data?.message ?? 'Webhook subscription updated.',
        placement: 'topRight',
        duration: 5,
      });
      refetchStatus();
    };

    socket.on('NEW_INSTAGRAM_EVENT', handleNewEvent);
    socket.on('AUTO_REPLY_SENT', handleAutoReply);
    socket.on('SUBSCRIPTION_UPDATED', handleSubscriptionUpdate);
    // Also listen for existing socket events
    socket.on('NEW_COMMENT', handleNewEvent);
    socket.on('RULE_MATCHED', handleAutoReply);

    return () => {
      socket.off('NEW_INSTAGRAM_EVENT', handleNewEvent);
      socket.off('AUTO_REPLY_SENT', handleAutoReply);
      socket.off('SUBSCRIPTION_UPDATED', handleSubscriptionUpdate);
      socket.off('NEW_COMMENT', handleNewEvent);
      socket.off('RULE_MATCHED', handleAutoReply);
    };
  }, [socket, refetchStatus]);

  /* ── Handlers ─────────────────────────────────────── */
  const handleReconnect = () => {
    window.location.href = `${API_URL}/instagram/native/business-login`;
  };

  const handleDisconnect = () => {
    if (!accountStatus?.account?.id) return;
    disconnect(accountStatus.account.id);
    clearPersistedAccountId();
    setAccountId(null);
  };

  /* ── Render: loading ───────────────────────────────── */
  if (statusLoading) {
    return <LoadingState message="Loading account status…" />;
  }

  /* ── Render: not connected ─────────────────────────── */
  if (!accountStatus?.connected || !accountStatus.account) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
          <ExclamationCircleOutlined style={{ fontSize: 36, color: '#d1d5db' }} />
        </div>
        <div>
          <Title level={4}>No Instagram Account Connected</Title>
          <p className="text-gray-500 text-sm">
            Connect your Instagram Business account from the main Instagram page first.
          </p>
        </div>
        <Button
          type="primary"
          href="/instagram/native"
          className="rounded-xl px-8 h-10"
          style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d)', border: 'none' }}
        >
          Go to Instagram Connect
        </Button>
      </div>
    );
  }

  const account = accountStatus.account;

  /* ── Tab items ─────────────────────────────────────── */
  const tabItems = [
    {
      key: 'posts',
      label: (
        <span className="flex items-center gap-1.5">
          <PictureOutlined />
          Posts
        </span>
      ),
      children: (
        <div className="pt-4">
          {postsError && (
            <Alert
              type="error"
              message="Failed to load posts"
              showIcon
              className="rounded-xl mb-4"
              action={
                <Button size="small" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              }
            />
          )}
          <ErrorBoundary>
            <PostsGrid
              posts={posts}
              isLoading={postsLoading}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              onLoadMore={fetchNextPage}
              onSelectPost={(post) => setSelectedPost(post)}
            />
          </ErrorBoundary>
        </div>
      ),
    },
    {
      key: 'automation',
      label: (
        <span className="flex items-center gap-1.5">
          <ThunderboltOutlined />
          Automation
        </span>
      ),
      children: (
        <div className="pt-4">
          <AutomationFormTab accountId={account.id} />
        </div>
      ),
    },
    {
      key: 'webhooks',
      label: (
        <span className="flex items-center gap-1.5">
          <WifiOutlined />
          Webhook Events
        </span>
      ),
      children: (
        <div className="pt-4">
          <WebhookEventsTable
            accountId={account.id}
            webhooksSubscribed={account.webhooksSubscribed}
          />
        </div>
      ),
    },
    {
      key: 'settings',
      label: (
        <span className="flex items-center gap-1.5">
          <SettingOutlined />
          Settings
        </span>
      ),
      children: (
        <div className="pt-4">
          <SettingsTab
            accountStatus={accountStatus}
            onReconnect={handleReconnect}
            onDisconnect={handleDisconnect}
            isDisconnecting={isDisconnecting}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Title level={3} className="!mb-0 flex items-center gap-2">
            <span
              className="inline-flex w-8 h-8 rounded-lg items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
            >
              IG
            </span>
            Instagram Automation
          </Title>
          <span className="text-sm text-gray-400">
            Manage automation rules, webhook events, and account settings
          </span>
        </div>

        <Button
          id="automation-page-reconnect-btn"
          icon={<ReloadOutlined />}
          onClick={handleReconnect}
          className="rounded-xl"
        >
          Reconnect Account
        </Button>
      </div>

      {/* ── Status error ── */}
      {statusError && (
        <Alert
          type="error"
          message="Could not load account status"
          showIcon
          className="rounded-xl"
          action={
            <Button size="small" onClick={() => refetchStatus()}>
              Retry
            </Button>
          }
        />
      )}

      {/* ── Connection status card ── */}
      {statusLoading ? (
        <AccountStatusCardSkeleton />
      ) : (
        <AccountStatusCard
          accountStatus={accountStatus}
          onReconnect={handleReconnect}
        />
      )}

      {/* ── Tabs ── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={(k) => {
            setActiveTab(k as ActiveTab);
          }}
          items={tabItems}
          style={{ padding: '0 24px' }}
          size="large"
        />
      </div>

      {/* ── Post Detail Drawer ── */}
      <Drawer
        title="Post Details"
        placement="right"
        width={500}
        onClose={() => setSelectedPost(null)}
        open={!!selectedPost}
        destroyOnClose
      >
        {selectedPost && (
          <div className="h-full">
            <CommentsTab
              posts={posts}
              postsLoading={postsLoading}
              initialPost={selectedPost}
              onClearInitialPost={() => setSelectedPost(null)}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
