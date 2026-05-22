'use client';

import React from 'react';
import { Avatar, Tag, Skeleton, Tooltip, Typography } from 'antd';
import {
  InstagramOutlined,
  CheckCircleFilled,
  WarningFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
  TeamOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import type { InstagramProfile } from '../types';
import type { TokenStatus } from '../types';

const { Title, Text } = Typography;

/* ── Derive token health status ─────────────────────── */
function getTokenStatus(expiresAt: string): TokenStatus {
  const msLeft = new Date(expiresAt).getTime() - Date.now();
  const daysLeft = msLeft / 86_400_000;
  if (daysLeft <= 0) return 'expired';
  if (daysLeft <= 7) return 'expiring_soon';
  return 'connected';
}

const STATUS_CONFIG: Record<TokenStatus, { color: string; icon: React.ReactNode; label: string }> =
  {
    connected: {
      color: 'success',
      icon: <CheckCircleFilled />,
      label: 'Connected',
    },
    expiring_soon: {
      color: 'warning',
      icon: <WarningFilled />,
      label: 'Expiring Soon',
    },
    expired: {
      color: 'error',
      icon: <CloseCircleFilled />,
      label: 'Token Expired',
    },
    disconnected: {
      color: 'default',
      icon: <CloseCircleFilled />,
      label: 'Disconnected',
    },
  };

/* ─── Skeleton loader ───────────────────────────────── */
export function ProfileCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
      <div className="flex items-center gap-4">
        <Skeleton.Avatar active size={80} />
        <div className="flex-1">
          <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 2, width: ['60%', '50%'] }} />
        </div>
      </div>
    </div>
  );
}

/* ═══ ProfileCard ═══════════════════════════════════════ */
interface ProfileCardProps {
  profile: InstagramProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const tokenStatus = getTokenStatus(profile.tokenExpiresAt);
  const { color, icon, label } = STATUS_CONFIG[tokenStatus];
  const daysLeft = Math.max(
    0,
    Math.floor((new Date(profile.tokenExpiresAt).getTime() - Date.now()) / 86_400_000)
  );
  const connectedAgo = formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true });

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" />

      <div className="p-6">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar with live-dot */}
          <div className="relative flex-shrink-0">
            <Avatar
              size={80}
              src={profile.profilePictureUrl || undefined}
              icon={!profile.profilePictureUrl && <InstagramOutlined />}
              className="border-2 border-purple-100"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                tokenStatus === 'connected'
                  ? 'bg-emerald-500'
                  : tokenStatus === 'expiring_soon'
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              }`}
            />
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Title level={5} className="!mb-0">
                @{profile.username}
              </Title>
              <Tag color={color} icon={icon} className="rounded-full m-0 text-xs">
                {label}
              </Tag>
            </div>

            {profile.name && (
              <Text type="secondary" className="text-sm block">
                {profile.name}
              </Text>
            )}

            {/* Account type */}
            {profile.accountType && (
              <Tag
                className="rounded-full text-xs m-0"
                style={{ background: '#f5f0ff', borderColor: '#d9b8ff', color: '#7c3aed' }}
              >
                {profile.accountType === 'BUSINESS' ? '🏢 Business Account' : '✨ Creator Account'}
              </Tag>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-4 pt-1 flex-wrap">
              <Tooltip title="Followers">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <TeamOutlined />
                  <span className="font-semibold text-gray-700">
                    {profile.followersCount.toLocaleString()}
                  </span>{' '}
                  followers
                </span>
              </Tooltip>
              <Tooltip title="Posts">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <PictureOutlined />
                  <span className="font-semibold text-gray-700">{profile.mediaCount}</span> posts
                </span>
              </Tooltip>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <ClockCircleOutlined />
                Connected {connectedAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.biography && (
          <Text type="secondary" className="text-xs block mt-4 leading-relaxed">
            {profile.biography}
          </Text>
        )}

        {/* Token expiry notice */}
        {tokenStatus !== 'connected' && (
          <div
            className={`mt-4 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 ${
              tokenStatus === 'expired'
                ? 'bg-red-50 text-red-600'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            <ClockCircleOutlined />
            {tokenStatus === 'expired'
              ? 'Access token has expired — please reconnect.'
              : `Access token expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Reconnect soon.`}
          </div>
        )}
      </div>
    </div>
  );
}
