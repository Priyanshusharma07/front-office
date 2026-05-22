'use client';

import React from 'react';
import { Avatar, Tag, Skeleton, Typography, Button, Tooltip } from 'antd';
import {
  InstagramOutlined,
  CheckCircleFilled,
  WarningFilled,
  CloseCircleFilled,
  ReloadOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import type { NativeAccountStatus } from '../types';

const { Title, Text } = Typography;

/* ── Skeleton ────────────────────────────────────────── */
export function AccountStatusCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
      <div className="flex items-center gap-4">
        <Skeleton.Avatar active size={60} />
        <div className="flex-1">
          <Skeleton active title={{ width: '35%' }} paragraph={{ rows: 2, width: ['50%', '40%'] }} />
        </div>
      </div>
    </div>
  );
}

/* ═══ AccountStatusCard ═════════════════════════════════ */
interface AccountStatusCardProps {
  accountStatus: NativeAccountStatus;
  onReconnect: () => void;
}

export function AccountStatusCard({ accountStatus, onReconnect }: AccountStatusCardProps) {
  const account = accountStatus.account;

  if (!account) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <InstagramOutlined className="text-2xl text-red-400" />
        </div>
        <div className="flex-1">
          <Text strong className="block text-red-700">Not Connected</Text>
          <Text type="secondary" className="text-xs">
            Connect your Instagram Business account to use automation.
          </Text>
        </div>
      </div>
    );
  }

  const daysLeft = Math.floor(
    (new Date(account.tokenExpiresAt).getTime() - Date.now()) / 86_400_000
  );
  const isExpired = daysLeft <= 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

  let tokenStatus: { color: string; icon: React.ReactNode; label: string } = {
    color: 'success',
    icon: <CheckCircleFilled />,
    label: 'Connected',
  };
  if (isExpired) {
    tokenStatus = { color: 'error', icon: <CloseCircleFilled />, label: 'Token Expired' };
  } else if (isExpiringSoon) {
    tokenStatus = { color: 'warning', icon: <WarningFilled />, label: 'Expiring Soon' };
  }

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Instagram gradient strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" />

      <div className="p-5 flex items-center gap-4 flex-wrap">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar
            size={56}
            src={account.profilePictureUrl || undefined}
            icon={!account.profilePictureUrl && <InstagramOutlined />}
            className="border-2 border-purple-100"
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
              isExpired ? 'bg-red-400' : isExpiringSoon ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
          />
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Title level={5} className="!mb-0 text-gray-900">
              @{account.username}
            </Title>
            <Tag color={tokenStatus.color} icon={tokenStatus.icon} className="rounded-full m-0 text-xs">
              {tokenStatus.label}
            </Tag>
            {account.webhooksSubscribed && (
              <Tooltip title="Webhook subscribed">
                <Tag color="blue" icon={<WifiOutlined />} className="rounded-full m-0 text-xs">
                  Webhooks
                </Tag>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Text type="secondary" className="text-xs">
              {account.followersCount.toLocaleString()} followers
            </Text>
            <Text type="secondary" className="text-xs">
              {account.mediaCount} posts
            </Text>
            <Text
              className={`text-xs ${isExpired ? 'text-red-500 font-medium' : isExpiringSoon ? 'text-amber-600 font-medium' : 'text-gray-400'}`}
            >
              {isExpired
                ? 'Token expired — reconnect required'
                : isExpiringSoon
                ? `Token expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                : 'Token valid'}
            </Text>
          </div>
        </div>

        {/* Reconnect */}
        <Button
          id="status-card-reconnect-btn"
          icon={<ReloadOutlined />}
          onClick={onReconnect}
          size="small"
          className="rounded-xl flex-shrink-0"
          danger={isExpired}
        >
          Reconnect
        </Button>
      </div>
    </div>
  );
}
