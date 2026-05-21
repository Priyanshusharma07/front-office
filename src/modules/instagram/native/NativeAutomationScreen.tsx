'use client';

import React, { useState } from 'react';
import {
  Button, Input, Switch, Typography, App, Tag, Divider, Alert,
} from 'antd';
import {
  SaveOutlined,
  ThunderboltOutlined,
  MessageOutlined,
  InstagramOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useApiClient } from '@/services/useApiClient';
import type { NativeTriggerPayload } from './types';

const { Title, Text, Paragraph } = Typography;

const TRIGGER_OPTIONS = [
  {
    key: 'comments',
    label: 'Comments',
    description: 'Trigger when someone comments on your post',
    icon: '💬',
  },
];

/* ─── Preview bubble ──────────────────────────────────── */
function PreviewBubble({ replyMessage }: { replyMessage: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-3">
      <Text strong className="text-xs text-gray-500 uppercase tracking-wider block">
        Live Preview
      </Text>

      {/* Incoming comment */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex-shrink-0 flex items-center justify-center">
          <InstagramOutlined className="text-white text-xs" />
        </div>
        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 shadow-sm border border-gray-100 max-w-xs">
          <Text className="text-sm text-gray-700">Great post! 🔥</Text>
        </div>
      </div>

      {/* Bot reply */}
      <div className="flex items-start gap-3 flex-row-reverse">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
          <Text className="text-white text-xs font-bold">You</Text>
        </div>
        <div className="bg-indigo-600 rounded-2xl rounded-tr-none px-4 py-2 shadow-sm max-w-xs">
          <Text className="text-sm text-white">
            {replyMessage || 'Your reply message will appear here…'}
          </Text>
        </div>
      </div>

      <Text type="secondary" className="text-xs block text-center pt-1">
        This private DM is sent automatically when someone comments
      </Text>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NativeAutomationScreen
═══════════════════════════════════════════════════════ */
export default function NativeAutomationScreen({
  instagramBusinessId,
  accountId,
  onBack,
  onSaved,
}: {
  instagramBusinessId?: string;
  accountId: string;
  onBack: () => void;
  onSaved?: () => void;
}) {
  const { message } = App.useApp();
  const api = useApiClient();

  const [triggerType, setTriggerType] = useState<string>('comments');
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [enabled, setEnabled] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const effectiveBizId = instagramBusinessId || accountId;

  const handleSave = async () => {
    if (!replyMessage.trim()) {
      message.warning('Please enter a reply message before saving.');
      return;
    }

    setSaving(true);
    try {
      const payload: NativeTriggerPayload = {
        instagramBusinessId: effectiveBizId,
        triggerType,
        replyMessage: replyMessage.trim(),
        enabled,
      };

      console.log('[NativeIG] POST /instagram/save-trigger', payload);
      await api.post('/instagram/save-trigger', payload);
      console.log('[NativeIG] Trigger saved successfully');

      message.success('Automation saved! Comments will now trigger private replies.');
      setSaved(true);
      onSaved?.();
    } catch (err: any) {
      console.error('[NativeIG] save-trigger error', err);
      message.error(
        err?.response?.data?.message || 'Failed to save automation. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto" suppressHydrationWarning>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          className="rounded-xl"
          size="small"
        >
          Back
        </Button>
        <div>
          <Title level={4} className="!mb-0 flex items-center gap-2">
            <ThunderboltOutlined className="text-indigo-500" />
            Configure Automation
          </Title>
          <Text type="secondary" className="text-xs">
            ID: {effectiveBizId}
          </Text>
        </div>
      </div>

      {/* Saved success banner */}
      {saved && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleFilled />}
          message="Automation is Live!"
          description="When someone comments on your Instagram posts, they'll receive an automatic private DM."
          className="rounded-2xl"
        />
      )}

      {/* Trigger type */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
        <div>
          <Title level={5} className="!mb-0.5">
            Trigger Type
          </Title>
          <Text type="secondary" className="text-sm">
            Choose what event activates the automation
          </Text>
        </div>

        <div className="grid gap-3">
          {TRIGGER_OPTIONS.map((opt) => {
            const active = triggerType === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setTriggerType(opt.key)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-150 cursor-pointer ${
                  active
                    ? 'border-indigo-500 bg-indigo-50/60'
                    : 'border-gray-100 bg-white hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <Text strong className="block text-sm">
                        {opt.label}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {opt.description}
                      </Text>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      active ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                    }`}
                  >
                    {active && <CheckCircleFilled className="text-white text-xs" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reply message */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageOutlined className="text-indigo-500" />
          <Title level={5} className="!mb-0">
            Reply Message
          </Title>
        </div>

        <Paragraph type="secondary" className="!mb-0 text-sm">
          This message will be sent as a private DM whenever the trigger fires.
        </Paragraph>

        <Input.TextArea
          rows={4}
          placeholder="e.g. Thanks for your comment! Click here to learn more: https://…"
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          maxLength={500}
          showCount
          className="rounded-xl"
        />
      </div>

      {/* Enable / disable toggle */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 flex items-center justify-between">
        <div>
          <Text strong className="block">
            Enable Automation
          </Text>
          <Text type="secondary" className="text-sm">
            {enabled ? 'Automation is active and will fire on trigger' : 'Automation is paused'}
          </Text>
        </div>
        <Switch
          checked={enabled}
          onChange={setEnabled}
          checkedChildren="ON"
          unCheckedChildren="OFF"
          className={enabled ? 'bg-indigo-600' : ''}
        />
      </div>

      <Divider className="my-0" />

      {/* Preview */}
      {replyMessage && <PreviewBubble replyMessage={replyMessage} />}

      {/* Save */}
      <Button
        type="primary"
        size="large"
        icon={<SaveOutlined />}
        loading={saving}
        disabled={!replyMessage.trim()}
        onClick={handleSave}
        block
        className="h-12 rounded-xl font-semibold text-base shadow-md"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
      >
        Save Automation
      </Button>

      {/* Tag metadata */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Tag className="rounded-full text-xs">
          Trigger: {TRIGGER_OPTIONS.find((o) => o.key === triggerType)?.label}
        </Tag>
        <Tag color={enabled ? 'success' : 'default'} className="rounded-full text-xs">
          {enabled ? '● Enabled' : '○ Disabled'}
        </Tag>
      </div>
    </div>
  );
}
