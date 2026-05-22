'use client';

import React, { useState } from 'react';
import { Tabs, Typography, Alert, Button } from 'antd';
import {
  PictureOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ProfileCard, ProfileCardSkeleton } from './ProfileCard';
import { PostsGrid } from './PostsGrid';
import { CommentsTab } from './CommentsTab';
import { NativeAutomationScreen } from './NativeAutomationScreen';
import { SettingsTab } from './SettingsTab';
import { useNativeProfile } from '../hooks/useNativeProfile';
import { useNativePosts } from '../hooks/useNativePosts';
import type { NativeAccountStatus, InstagramPost } from '../types';

const { Title } = Typography;

type ActiveTab = 'posts' | 'comments' | 'automation' | 'settings';

interface NativeManagementScreenProps {
  accountStatus: NativeAccountStatus;
  onReconnect: () => void;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}

export function NativeManagementScreen({
  accountStatus,
  onReconnect,
  onDisconnect,
  isDisconnecting,
}: NativeManagementScreenProps) {
  const account = accountStatus.account!;
  const [activeTab, setActiveTab] = useState<ActiveTab>('posts');
  // Posts tab: selected post for drilldown (passed to comments tab as pre-selected)
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  /* ── Data hooks ────────────────────────────────────── */
  const { profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } =
    useNativeProfile(account.id);

  const {
    posts,
    isLoading: postsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: postsError,
  } = useNativePosts(account.id);

  /* ── Open Comments tab from the Posts grid ──────── */
  const handleSelectPostForComments = (post: InstagramPost) => {
    setSelectedPost(post);
    setActiveTab('comments');
  };

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
              description="Unable to fetch your posts. Please try refreshing."
              showIcon
              className="rounded-xl mb-4"
              action={
                <Button size="small" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              }
            />
          )}
          <PostsGrid
            posts={posts}
            isLoading={postsLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onLoadMore={fetchNextPage}
            onSelectPost={handleSelectPostForComments}
          />
        </div>
      ),
    },
    {
      key: 'comments',
      label: (
        <span className="flex items-center gap-1.5">
          <MessageOutlined />
          Comments
        </span>
      ),
      children: (
        <div className="pt-4">
          <CommentsTab
            posts={posts}
            postsLoading={postsLoading}
            initialPost={selectedPost}
            onClearInitialPost={() => setSelectedPost(null)}
          />
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
          <NativeAutomationScreen
            account={{ id: account.id, username: account.username }}
            onBack={() => setActiveTab('posts')}
            embedded
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
            onReconnect={onReconnect}
            onDisconnect={onDisconnect}
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
              className="inline-flex w-8 h-8 rounded-lg items-center justify-center text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
            >
              IG
            </span>
            Instagram Native
          </Title>
          <span className="text-sm text-gray-400">Manage your connected Instagram Business account</span>
        </div>

        <Button
          id="reconnect-header-btn"
          icon={<ReloadOutlined />}
          onClick={onReconnect}
          className="rounded-xl"
        >
          Reconnect
        </Button>
      </div>

      {/* ── Profile card ── */}
      {profileError ? (
        <Alert
          type="warning"
          message="Could not load profile details"
          description="Profile information is unavailable. Your account is still connected."
          showIcon
          className="rounded-xl"
          action={
            <Button size="small" onClick={() => refetchProfile()}>
              Retry
            </Button>
          }
        />
      ) : profileLoading ? (
        <ProfileCardSkeleton />
      ) : profile ? (
        <ProfileCard profile={profile} />
      ) : null}

      {/* ── Tabs ── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={(k) => {
            setActiveTab(k as ActiveTab);
            // Clear drilldown when switching away from comments
            if (k !== 'comments') setSelectedPost(null);
          }}
          items={tabItems}
          className="instagram-management-tabs"
          style={{ padding: '0 24px' }}
          size="large"
        />
      </div>
    </div>
  );
}
