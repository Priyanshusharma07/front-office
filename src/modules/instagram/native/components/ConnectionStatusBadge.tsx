'use client';

import React from 'react';
import { Tag, Tooltip } from 'antd';
import {
  CheckCircleFilled,
  WarningFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { TokenStatus } from '../types';

interface ConnectionStatusBadgeProps {
  tokenExpiresAt?: string;
  isConnected: boolean;
  showLabel?: boolean;
}

function deriveStatus(isConnected: boolean, tokenExpiresAt?: string): TokenStatus {
  if (!isConnected) return 'disconnected';
  if (!tokenExpiresAt) return 'connected';
  const daysLeft = (new Date(tokenExpiresAt).getTime() - Date.now()) / 86_400_000;
  if (daysLeft <= 0) return 'expired';
  if (daysLeft <= 7) return 'expiring_soon';
  return 'connected';
}

const CONFIG: Record<
  TokenStatus,
  { color: string; icon: React.ReactNode; label: string; tooltip: string }
> = {
  connected: {
    color: 'success',
    icon: <CheckCircleFilled />,
    label: 'Connected',
    tooltip: 'Account is connected and active',
  },
  expiring_soon: {
    color: 'warning',
    icon: <WarningFilled />,
    label: 'Expiring Soon',
    tooltip: 'Access token will expire within 7 days — please reconnect',
  },
  expired: {
    color: 'error',
    icon: <CloseCircleFilled />,
    label: 'Token Expired',
    tooltip: 'Access token has expired — please reconnect to restore automation',
  },
  disconnected: {
    color: 'default',
    icon: <ClockCircleOutlined />,
    label: 'Disconnected',
    tooltip: 'Account is not connected',
  },
};

export function ConnectionStatusBadge({
  tokenExpiresAt,
  isConnected,
  showLabel = true,
}: ConnectionStatusBadgeProps) {
  const status = deriveStatus(isConnected, tokenExpiresAt);
  const { color, icon, label, tooltip } = CONFIG[status];

  return (
    <Tooltip title={tooltip}>
      <Tag
        color={color}
        icon={icon}
        className="rounded-full m-0 cursor-default"
        style={{ userSelect: 'none' }}
      >
        {showLabel ? label : null}
      </Tag>
    </Tooltip>
  );
}
