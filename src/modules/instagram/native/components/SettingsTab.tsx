'use client';

import React from 'react';
import {
  Button, Divider, Popconfirm, Tag, Typography, Alert,
} from 'antd';
import {
  DisconnectOutlined,
  ReloadOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';
import type { NativeAccountStatus } from '../types';

const { Title, Text } = Typography;

interface SettingsTabProps {
  accountStatus: NativeAccountStatus;
  onReconnect: () => void;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}

export function SettingsTab({
  accountStatus,
  onReconnect,
  onDisconnect,
  isDisconnecting,
}: SettingsTabProps) {
  const account = accountStatus.account;
  if (!account) return null;

  const tokenExpiresAt = account.tokenExpiresAt;
  const daysLeft = Math.floor(
    (new Date(tokenExpiresAt).getTime() - Date.now()) / 86_400_000
  );
  const isExpired = daysLeft <= 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
  const connectedAgo = formatDistanceToNow(new Date(account.createdAt), { addSuffix: true });

  return (
    <div className="max-w-xl space-y-5">

      {/* Token health */}
      {isExpired ? (
        <Alert
          type="error"
          showIcon
          icon={<ExclamationCircleFilled />}
          message="Access Token Expired"
          description="Your Instagram access token has expired. Automation and API calls will fail until you reconnect."
          action={
            <Button
              size="small"
              type="primary"
              danger
              onClick={onReconnect}
              className="rounded-lg"
            >
              Reconnect Now
            </Button>
          }
          className="rounded-xl"
        />
      ) : isExpiringSoon ? (
        <Alert
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          message={`Token expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
          description="Reconnect soon to avoid interruption."
          className="rounded-xl"
        />
      ) : null}

      {/* Account details card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
        <Title level={5} className="!mb-0">
          Account Details
        </Title>

        {[
          { label: 'Username', value: `@${account.username}` },
          { label: 'Instagram User ID', value: account.instagramUserId },
          { label: 'Account ID', value: account.id },
          {
            label: 'Connected',
            value: connectedAgo,
          },
          {
            label: 'Token Status',
            value: (
              <ConnectionStatusBadge
                isConnected={account.isActive}
                tokenExpiresAt={account.tokenExpiresAt}
              />
            ),
          },
          {
            label: 'Webhooks',
            value: account.webhooksSubscribed ? (
              <Tag color="success" icon={<CheckCircleFilled />} className="rounded-full m-0">
                Subscribed
              </Tag>
            ) : (
              <Tag color="warning" icon={<ExclamationCircleFilled />} className="rounded-full m-0">
                Not subscribed
              </Tag>
            ),
          },
          {
            label: 'Token Expiry',
            value: (
              <span className={isExpired ? 'text-red-500' : isExpiringSoon ? 'text-amber-600' : ''}>
                {new Date(tokenExpiresAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {isExpired
                  ? ' (Expired)'
                  : isExpiringSoon
                  ? ` (${daysLeft} days left)`
                  : ''}
              </span>
            ),
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
            <Text type="secondary" className="text-sm">
              {label}
            </Text>
            {typeof value === 'string' ? (
              <Text className="text-sm font-medium text-right max-w-[60%] truncate">{value}</Text>
            ) : (
              value
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
        <Title level={5} className="!mb-0">
          Account Actions
        </Title>
        <Text type="secondary" className="text-sm block">
          Reconnect to refresh your access token or disconnect to remove the account.
        </Text>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            id="settings-reconnect-btn"
            icon={<ReloadOutlined />}
            onClick={onReconnect}
            size="large"
            className="rounded-xl h-11"
          >
            Reconnect Account
          </Button>

          <Popconfirm
            title="Disconnect Instagram?"
            description="This will remove the account, revoke tokens, and pause all automations."
            onConfirm={onDisconnect}
            okText="Disconnect"
            okButtonProps={{ danger: true }}
          >
            <Button
              id="settings-disconnect-btn"
              danger
              icon={<DisconnectOutlined />}
              loading={isDisconnecting}
              size="large"
              className="rounded-xl h-11"
              block
            >
              {isDisconnecting ? 'Disconnecting…' : 'Disconnect Account'}
            </Button>
          </Popconfirm>
        </div>

        <Divider className="my-0" />

        <Text type="secondary" className="text-xs">
          Disconnecting will immediately stop all automations and remove stored tokens. Your Instagram account data is not affected.
        </Text>
      </div>
    </div>
  );
}
