'use client';

import React from 'react';
import {
  Table, Button, Tag, Empty, Badge, Tooltip,
  Typography, Alert, Skeleton,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ReloadOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  SendOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useNativeWebhookEvents } from '../hooks/useNativeWebhookEvents';
import type { WebhookEvent } from '../types';

const { Text } = Typography;

/* ── Event type color map ────────────────────────────── */
const EVENT_COLOR: Record<string, string> = {
  comments:  'purple',
  messages:  'blue',
  mentions:  'cyan',
  story_reply: 'orange',
};

function eventColor(type: string): string {
  return EVENT_COLOR[type.toLowerCase()] ?? 'default';
}

/* ── Skeleton ────────────────────────────────────────── */
function WebhookTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-4">
          <Skeleton active paragraph={{ rows: 1 }} title={{ width: '30%' }} />
        </div>
      ))}
    </div>
  );
}

/* ── Subscribe CTA ───────────────────────────────────── */
interface SubscribeCtaProps {
  accountId: string;
  onSubscribe: () => Promise<void>;
  isSubscribing: boolean;
}

function SubscribeCta({ onSubscribe, isSubscribing }: SubscribeCtaProps) {
  return (
    <Alert
      type="warning"
      showIcon
      message="Webhooks not subscribed"
      description="Subscribe to Instagram webhooks to receive real-time comment and message notifications."
      className="rounded-xl mb-4"
      action={
        <Button
          id="subscribe-webhook-btn"
          type="primary"
          size="small"
          loading={isSubscribing}
          onClick={onSubscribe}
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
        >
          Subscribe Now
        </Button>
      }
    />
  );
}

/* ═══ WebhookEventsTable ════════════════════════════════ */
interface WebhookEventsTableProps {
  accountId: string;
  webhooksSubscribed: boolean;
}

export function WebhookEventsTable({
  accountId,
  webhooksSubscribed,
}: WebhookEventsTableProps) {
  const {
    events,
    total,
    isLoading,
    isFetching,
    error,
    refetch,
    subscribeWebhook,
    isSubscribing,
  } = useNativeWebhookEvents(accountId);

  const columns: ColumnsType<WebhookEvent> = [
    {
      title: 'Event Type',
      dataIndex: 'eventType',
      key: 'eventType',
      width: 140,
      render: (type: string) => (
        <Tag color={eventColor(type)} className="rounded-full m-0 capitalize text-xs">
          {type}
        </Tag>
      ),
    },
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      width: 130,
      render: (username?: string) =>
        username ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#833ab4] to-[#fd1d1d] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[9px] font-bold">
                {username[0]?.toUpperCase()}
              </span>
            </div>
            <Text className="text-xs font-medium">@{username}</Text>
          </div>
        ) : (
          <Text type="secondary" className="text-xs">—</Text>
        ),
    },
    {
      title: 'Comment / Message',
      dataIndex: 'commentText',
      key: 'commentText',
      render: (text?: string) =>
        text ? (
          <Text className="text-sm text-gray-700 line-clamp-2">{text}</Text>
        ) : (
          <Text type="secondary" className="text-xs italic">No text</Text>
        ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 130,
      render: (ts: string) => {
        try {
          return (
            <Tooltip title={new Date(ts).toLocaleString()}>
              <Text type="secondary" className="text-xs">
                {formatDistanceToNow(parseISO(ts), { addSuffix: true })}
              </Text>
            </Tooltip>
          );
        } catch {
          return <Text type="secondary" className="text-xs">—</Text>;
        }
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 160,
      render: (_, record) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tooltip title={record.processed ? 'Processed' : 'Pending'}>
            <Badge
              status={record.processed ? 'success' : 'processing'}
              text={
                <Text className="text-xs">
                  {record.processed ? 'Processed' : 'Pending'}
                </Text>
              }
            />
          </Tooltip>
          {record.autoReplySent !== undefined && (
            <Tooltip title={record.autoReplySent ? 'Auto-reply sent' : 'No auto-reply'}>
              <Tag
                icon={
                  record.autoReplySent ? (
                    <CheckCircleFilled style={{ fontSize: 10 }} />
                  ) : (
                    <CloseCircleFilled style={{ fontSize: 10 }} />
                  )
                }
                color={record.autoReplySent ? 'success' : 'default'}
                className="rounded-full text-xs m-0"
              >
                <SendOutlined style={{ fontSize: 9 }} />
              </Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">

      {/* Subscribe CTA if not subscribed */}
      {!webhooksSubscribed && (
        <SubscribeCta
          accountId={accountId}
          onSubscribe={() => subscribeWebhook(accountId)}
          isSubscribing={isSubscribing}
        />
      )}

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message="Failed to load webhook events"
          showIcon
          className="rounded-xl"
        />
      )}

      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <Text strong>Webhook Events</Text>
          {total !== undefined && (
            <Text type="secondary" className="text-xs ml-2">
              {total.toLocaleString()} total
            </Text>
          )}
        </div>
        <Button
          id="refresh-webhook-events-btn"
          icon={<ReloadOutlined spin={isFetching && !isLoading} />}
          size="small"
          onClick={() => refetch()}
          loading={isLoading}
          className="rounded-xl"
        >
          Refresh
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <WebhookTableSkeleton />
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <Table<WebhookEvent>
            columns={columns}
            dataSource={events}
            rowKey="id"
            pagination={
              events.length > 25
                ? { pageSize: 25, size: 'small', showTotal: (t) => `${t} events` }
                : false
            }
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    webhooksSubscribed
                      ? 'No webhook events received yet. Events will appear here once Instagram sends notifications.'
                      : 'Subscribe to webhooks above to start receiving events.'
                  }
                  className="py-10"
                />
              ),
            }}
            size="middle"
            scroll={{ x: 700 }}
          />
        </div>
      )}
    </div>
  );
}
