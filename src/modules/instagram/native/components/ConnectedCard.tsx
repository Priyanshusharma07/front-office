'use client';

import React from 'react';
import {
  Avatar, Button, Tag, Popconfirm, Alert, Typography, Divider,
} from 'antd';
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  DisconnectOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  InstagramOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';

const { Title, Text } = Typography;

interface ConnectedCardProps {
  account: {
    id: string;
    username: string;
    profilePictureUrl: string;
    followersCount: number;
    mediaCount: number;
    tokenExpiresAt: string;
    webhooksSubscribed: boolean;
    isActive: boolean;
    createdAt: string;
  };
  onDisconnect: () => void;
  onConfigureAutomation: () => void;
  onReconnect: () => void;
  isDisconnecting: boolean;
}

/** Token expiry warning strip — only shown when ≤30 days remain */
function TokenExpiryBanner({ iso }: { iso: string }) {
  const days = Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days > 30) return null;

  return (
    <Alert
      showIcon
      icon={<ClockCircleOutlined />}
      type={days <= 0 ? 'error' : days <= 7 ? 'error' : 'warning'}
      className="rounded-xl"
      message={
        days <= 0
          ? 'Access token has expired — please reconnect.'
          : `Access token expires in ${days} day${days !== 1 ? 's' : ''}`
      }
    />
  );
}

export function ConnectedCard({
  account,
  onDisconnect,
  onConfigureAutomation,
  onReconnect,
  isDisconnecting,
}: ConnectedCardProps) {
  const connectedAgo = formatDistanceToNow(new Date(account.createdAt), { addSuffix: true });

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden max-w-xl mx-auto">
      {/* Instagram gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" />

      <div className="p-6 space-y-5">

        {/* ── Account identity ── */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <Avatar
              size={72}
              src={account.profilePictureUrl || undefined}
              icon={!account.profilePictureUrl && <InstagramOutlined />}
              className="border-2 border-indigo-100"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                account.isActive ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Title level={5} className="!mb-0 text-gray-900">
                @{account.username}
              </Title>
              <Tag color="success" icon={<CheckCircleFilled />} className="m-0 rounded-full">
                Connected
              </Tag>
            </div>
            <Text type="secondary" className="text-xs">
              {account.followersCount.toLocaleString()} followers · {account.mediaCount} posts
            </Text>
            <Text type="secondary" className="text-xs block">
              Connected {connectedAgo}
            </Text>
          </div>
        </div>

        {/* ── Status badges ── */}
        <div className="flex flex-wrap gap-2">
          {account.webhooksSubscribed ? (
            <Tag color="success" className="rounded-full m-0">
              <CheckCircleFilled className="mr-1" />Webhooks Active
            </Tag>
          ) : (
            <Tag color="warning" className="rounded-full m-0">
              <ExclamationCircleFilled className="mr-1" />Webhooks Inactive
            </Tag>
          )}
          <Tag color={account.isActive ? 'purple' : 'default'} className="rounded-full m-0">
            {account.isActive ? '⚡ Automations On' : '○ Automations Off'}
          </Tag>
        </div>

        {/* ── Token expiry ── */}
        <TokenExpiryBanner iso={account.tokenExpiresAt} />

        <Divider className="my-0" />

        {/* ── Primary actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            id="configure-automation-btn"
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={onConfigureAutomation}
            className="h-10 rounded-xl font-medium"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
          >
            Configure Automation
          </Button>

          <Button
            id="reconnect-account-btn"
            icon={<ReloadOutlined />}
            onClick={onReconnect}
            className="h-10 rounded-xl font-medium"
          >
            Reconnect Account
          </Button>
        </div>

        {/* ── Disconnect ── */}
        <Popconfirm
          title="Disconnect Instagram?"
          description="This will remove the account, revoke tokens, and pause all automations."
          onConfirm={onDisconnect}
          okText="Disconnect"
          okButtonProps={{ danger: true }}
        >
          <Button
            id="disconnect-account-btn"
            block
            danger
            icon={<DisconnectOutlined />}
            loading={isDisconnecting}
            className="h-10 rounded-xl font-medium"
          >
            {isDisconnecting ? 'Disconnecting…' : 'Disconnect Account'}
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
}
