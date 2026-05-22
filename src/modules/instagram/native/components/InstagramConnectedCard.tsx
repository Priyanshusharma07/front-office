'use client';

import React from 'react';
import { Avatar, Tag, Typography, Divider, Skeleton } from 'antd';
import {
  CheckCircleFilled,
  WarningFilled,
  CloseCircleFilled,
  WifiOutlined,
  SafetyCertificateOutlined,
  InstagramOutlined,
  TeamOutlined,
  PictureOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import type { NativeAccountStatus } from '../types';

const { Title, Text } = Typography;

/* ── Skeleton ────────────────────────────────────────── */
export function InstagramConnectedCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
      <div className="flex items-center gap-5">
        <Skeleton.Avatar active size={80} />
        <div className="flex-1">
          <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 3, width: ['60%', '45%', '55%'] }} />
        </div>
      </div>
    </div>
  );
}

/* ═══ InstagramConnectedCard ════════════════════════════
   Displays the connected account using EITHER the flat
   backend response OR the normalised NativeAccountStatus.
   Works with whatever shape arrives.
════════════════════════════════════════════════════════ */
interface InstagramConnectedCardProps {
  /** Normalised status from useNativeAccount / getAccountStatus */
  data: NativeAccountStatus;
  /** Optional extra raw fields the backend sends at the top level */
  raw?: Record<string, any>;
}

export function InstagramConnectedCard({ data, raw = {} }: InstagramConnectedCardProps) {
  if (!data.connected || !data.account) return null;

  const a = data.account;

  /* ── Token health ─────────────────────────────────── */
  const daysLeft = Math.floor(
    (new Date(a.tokenExpiresAt).getTime() - Date.now()) / 86_400_000
  );
  const isExpired    = daysLeft <= 0;
  const isExpiringSoon = !isExpired && daysLeft <= 7;

  const tokenTag = isExpired
    ? { color: 'error',   icon: <CloseCircleFilled />, label: 'Token Expired'    }
    : isExpiringSoon
    ? { color: 'warning', icon: <WarningFilled />,     label: 'Expiring Soon'    }
    : { color: 'success', icon: <CheckCircleFilled />, label: 'Token Active'     };

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Instagram gradient strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" />

      <div className="p-6 space-y-5">

        {/* ── Identity row ── */}
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar with live dot */}
          <div className="relative flex-shrink-0">
            <Avatar
              size={80}
              src={a.profilePictureUrl || undefined}
              icon={!a.profilePictureUrl && <InstagramOutlined />}
              className="border-2 border-purple-100"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                isExpired ? 'bg-red-400' : isExpiringSoon ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
            />
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0 space-y-2">
            <Title level={4} className="!mb-0">
              @{a.username}
            </Title>

            <div className="flex flex-wrap gap-2">
              {/* Connected */}
              <Tag color="green" icon={<CheckCircleFilled />} className="rounded-full m-0 text-xs">
                Connected
              </Tag>

              {/* Webhook */}
              <Tag
                color={a.webhooksSubscribed ? 'blue' : 'default'}
                icon={<WifiOutlined />}
                className="rounded-full m-0 text-xs"
              >
                {a.webhooksSubscribed ? 'Webhook Active' : 'Webhook Inactive'}
              </Tag>

              {/* Token status */}
              <Tag
                color={tokenTag.color}
                icon={tokenTag.icon}
                className="rounded-full m-0 text-xs"
              >
                {tokenTag.label}
              </Tag>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-5 flex-wrap pt-1">
              {a.followersCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <TeamOutlined />
                  <span className="font-semibold text-gray-700">
                    {a.followersCount.toLocaleString()}
                  </span>{' '}
                  followers
                </span>
              )}
              {a.mediaCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <PictureOutlined />
                  <span className="font-semibold text-gray-700">{a.mediaCount}</span> posts
                </span>
              )}
            </div>
          </div>
        </div>

        <Divider className="my-0" />

        {/* ── Detail grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailRow
            label="Instagram Business ID"
            value={a.instagramUserId || '—'}
            mono
          />
          <DetailRow
            label="Token Expiry"
            value={
              isExpired
                ? 'Expired'
                : `${new Date(a.tokenExpiresAt).toLocaleDateString()} (${daysLeft}d left)`
            }
            valueClass={isExpired ? 'text-red-500 font-medium' : isExpiringSoon ? 'text-amber-600 font-medium' : ''}
          />
          <DetailRow
            label="Connected"
            value={formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
          />
          <DetailRow
            label="Automation"
            value={
              <Tag
                color={raw.automationEnabled ? 'purple' : 'default'}
                className="rounded-full text-xs m-0"
              >
                {raw.automationEnabled ? '⚡ Enabled' : '○ Disabled'}
              </Tag>
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ── Small helper ─────────────────────────────────────── */
function DetailRow({
  label,
  value,
  mono = false,
  valueClass = '',
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <Text type="secondary" className="text-xs uppercase tracking-wide">
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text className={`text-sm font-medium truncate ${mono ? 'font-mono text-xs' : ''} ${valueClass}`}>
          {value}
        </Text>
      ) : (
        value
      )}
    </div>
  );
}
