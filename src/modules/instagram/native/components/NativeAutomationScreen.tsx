'use client';

import React, { useState } from 'react';
import {
  Button, Input, Switch, Select, Typography, Tag, Divider, Alert, Popconfirm, App,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
  MessageOutlined,
  CheckCircleFilled,
  PlusOutlined,
} from '@ant-design/icons';
import { useNativeAutomation } from '../hooks/useNativeAutomation';
import type { AutomationTrigger } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/* ─── Trigger options ─────────────────────────────────── */
const TRIGGER_TYPES: { value: AutomationTrigger['triggerType']; label: string; emoji: string }[] =
  [
    { value: 'comment', label: 'Comments on your post', emoji: '💬' },
    { value: 'dm', label: 'Sends you a DM', emoji: '✉️' },
    { value: 'mention', label: 'Mentions you in a story', emoji: '@' },
    { value: 'story_reply', label: 'Replies to your story', emoji: '📖' },
  ];

const REPLY_TYPES: { value: AutomationTrigger['replyType']; label: string }[] = [
  { value: 'dm', label: 'Direct Message (Private)' },
  { value: 'comment_reply', label: 'Comment Reply (Public)' },
];

/* ─── Blank trigger template ──────────────────────────── */
const BLANK_TRIGGER: Omit<AutomationTrigger, 'id'> = {
  triggerType: 'comment',
  triggerKeyword: '',
  replyMessage: '',
  replyType: 'dm',
  isActive: true,
};

/* ─── Preview bubble ──────────────────────────────────── */
function PreviewBubble({ replyMessage }: { replyMessage: string }) {
  if (!replyMessage) return null;
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
      <Text strong className="text-xs text-gray-500 uppercase tracking-wider block">
        Message Preview
      </Text>
      {/* Incoming comment bubble */}
      <div className="flex items-end gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#833ab4] to-[#fd1d1d] flex-shrink-0" />
        <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2 shadow-sm border border-gray-100 text-sm text-gray-700 max-w-[75%]">
          Great post! 🔥
        </div>
      </div>
      {/* Bot reply bubble */}
      <div className="flex items-end gap-2 flex-row-reverse">
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
          <Text className="text-white text-[10px] font-bold">You</Text>
        </div>
        <div className="bg-indigo-600 rounded-2xl rounded-br-none px-4 py-2 shadow-sm text-sm text-white max-w-[75%]">
          {replyMessage}
        </div>
      </div>
      <Text type="secondary" className="text-xs block text-center">
        This private reply is sent automatically
      </Text>
    </div>
  );
}

/* ─── Single existing automation row ─────────────────── */
function AutomationRow({
  automation,
  onDelete,
  isDeleting,
}: {
  automation: AutomationTrigger;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const triggerLabel =
    TRIGGER_TYPES.find((t) => t.value === automation.triggerType)?.label ?? automation.triggerType;
  const replyLabel =
    REPLY_TYPES.find((r) => r.value === automation.replyType)?.label ?? automation.replyType;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/40 gap-4">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag color="purple" className="rounded-full text-xs m-0">
            {TRIGGER_TYPES.find((t) => t.value === automation.triggerType)?.emoji}{' '}
            {triggerLabel}
          </Tag>
          <Tag color="blue" className="rounded-full text-xs m-0">
            → {replyLabel}
          </Tag>
          {automation.triggerKeyword && (
            <Tag className="rounded-full text-xs m-0">
              keyword: &quot;{automation.triggerKeyword}&quot;
            </Tag>
          )}
        </div>
        <Text className="text-xs text-gray-600 truncate block">
          &quot;{automation.replyMessage}&quot;
        </Text>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Tag color={automation.isActive ? 'success' : 'default'} className="rounded-full m-0">
          {automation.isActive ? '● On' : '○ Off'}
        </Tag>
        <Popconfirm
          title="Delete this automation?"
          onConfirm={() => onDelete(automation.id!)}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={isDeleting}
            className="rounded-lg"
          />
        </Popconfirm>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NativeAutomationScreen
═══════════════════════════════════════════════════════ */
interface NativeAutomationScreenProps {
  account: { id: string; username: string };
  onBack: () => void;
  /** When true, hides the Back button (component is embedded in a tab) */
  embedded?: boolean;
}

export function NativeAutomationScreen({ account, onBack, embedded = false }: NativeAutomationScreenProps) {
  const { message } = App.useApp();
  const { automations, isLoading, saveAutomation, isSaving, deleteAutomation, isDeleting, deletingId } =
    useNativeAutomation(account.id);

  const [form, setForm] = useState<Omit<AutomationTrigger, 'id'>>(BLANK_TRIGGER);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!form.replyMessage.trim()) {
      message.warning('Please enter a reply message before saving.');
      return;
    }
    try {
      await saveAutomation(form as AutomationTrigger);
      message.success('Automation saved successfully!');
      setSaved(true);
      setForm(BLANK_TRIGGER);
      setTimeout(() => setSaved(false), 4000);
    } catch {
      message.error('Failed to save automation. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto" suppressHydrationWarning>

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        {!embedded && (
          <Button
            id="automation-back-btn"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            size="small"
            className="rounded-xl"
          >
            Back
          </Button>
        )}
        <div>
          <Title level={4} className="!mb-0 flex items-center gap-2">
            <ThunderboltOutlined className="text-indigo-500" />
            Automation Setup
          </Title>
          <Text type="secondary" className="text-xs">
            Configure auto-replies for @{account.username}
          </Text>
        </div>
      </div>

      {/* ── Save success banner ── */}
      {saved && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleFilled />}
          message="Automation is Live!"
          description="Replies will fire automatically when the trigger condition is met."
          className="rounded-2xl"
          closable
          onClose={() => setSaved(false)}
        />
      )}

      {/* ── New trigger form ── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2">
          <PlusOutlined className="text-indigo-500" />
          <Title level={5} className="!mb-0">
            Create New Automation
          </Title>
        </div>
        <Text type="secondary" className="text-sm block -mt-2">
          Set up automatic responses for comments and messages
        </Text>

        {/* Trigger type */}
        <div className="space-y-1">
          <Text strong className="text-sm">
            When someone…
          </Text>
          <Select
            id="trigger-type-select"
            value={form.triggerType}
            onChange={(val) => setForm((f) => ({ ...f, triggerType: val }))}
            className="w-full"
            size="large"
            options={TRIGGER_TYPES.map((t) => ({
              value: t.value,
              label: (
                <span>
                  {t.emoji} {t.label}
                </span>
              ),
            }))}
          />
        </div>

        {/* Keyword filter */}
        <div className="space-y-1">
          <Text strong className="text-sm">
            Containing keyword{' '}
            <Text type="secondary" className="text-xs font-normal">
              (optional — leave blank to match all)
            </Text>
          </Text>
          <Input
            id="trigger-keyword-input"
            placeholder='e.g. "price", "info"'
            value={form.triggerKeyword}
            onChange={(e) => setForm((f) => ({ ...f, triggerKeyword: e.target.value }))}
            className="rounded-xl"
            size="large"
          />
        </div>

        {/* Reply type */}
        <div className="space-y-1">
          <Text strong className="text-sm">
            Reply via…
          </Text>
          <Select
            id="reply-type-select"
            value={form.replyType}
            onChange={(val) => setForm((f) => ({ ...f, replyType: val }))}
            className="w-full"
            size="large"
            options={REPLY_TYPES.map((r) => ({ value: r.value, label: r.label }))}
          />
        </div>

        {/* Reply message */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageOutlined className="text-indigo-500" />
            <Text strong className="text-sm">
              Reply message
            </Text>
          </div>
          <TextArea
            id="reply-message-input"
            rows={4}
            placeholder='e.g. Thanks for reaching out! Use {username} to personalise.'
            value={form.replyMessage}
            onChange={(e) => setForm((f) => ({ ...f, replyMessage: e.target.value }))}
            maxLength={500}
            showCount
            className="rounded-xl"
          />
        </div>

        {/* Enable toggle */}
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/40 p-4">
          <div>
            <Text strong className="block text-sm">
              Enable automation
            </Text>
            <Text type="secondary" className="text-xs">
              {form.isActive ? 'Active — will fire on trigger' : 'Paused'}
            </Text>
          </div>
          <Switch
            checked={form.isActive}
            onChange={(val) => setForm((f) => ({ ...f, isActive: val }))}
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
        </div>

        {/* Preview */}
        <PreviewBubble replyMessage={form.replyMessage} />

        <Divider className="my-0" />

        {/* Save */}
        <Button
          id="save-automation-btn"
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={isSaving}
          disabled={!form.replyMessage.trim()}
          onClick={handleSave}
          block
          className="h-12 rounded-xl font-semibold text-base shadow-md"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
        >
          {isSaving ? 'Saving…' : 'Save Automation'}
        </Button>
      </div>

      {/* ── Existing automations list ── */}
      {!isLoading && automations.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
          <Title level={5} className="!mb-0">
            Active Automations
          </Title>
          <div className="space-y-3">
            {automations.map((a) => (
              <AutomationRow
                key={a.id}
                automation={a}
                onDelete={deleteAutomation}
                isDeleting={isDeleting && deletingId === a.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
