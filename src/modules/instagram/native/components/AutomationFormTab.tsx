'use client';

import React, { useState, useEffect } from 'react';
import {
  Switch, Select, Input, Button, Tag, Divider, Alert,
  Skeleton, Typography, App,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  CloseOutlined,
  ThunderboltOutlined,
  MessageOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useNativeAutomationConfig } from '../hooks/useNativeAutomationConfig';
import type { AutomationConfig } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const REPLY_TYPE_OPTIONS = [
  { value: 'private', label: '✉️  Private Reply (DM)' },
  { value: 'public',  label: '💬  Public Reply (Comment)' },
];

const SUGGESTED_KEYWORDS = ['price', 'cost', 'buy', 'details', 'info', 'discount', 'order'];

interface AutomationFormTabProps {
  accountId: string;
}

export function AutomationFormTab({ accountId }: AutomationFormTabProps) {
  const { message: antMessage } = App.useApp();
  const { config, isLoading, saveConfig, isSaving } = useNativeAutomationConfig(accountId);

  /* ── Local form state ──────────────────────────────── */
  const [isEnabled, setIsEnabled] = useState(true);
  const [keywords, setKeywords] = useState<string[]>(['price', 'cost']);
  const [keywordInput, setKeywordInput] = useState('');
  const [replyType, setReplyType] = useState<'public' | 'private'>('private');
  const [replyMessage, setReplyMessage] = useState('');
  const [savedOk, setSavedOk] = useState(false);

  /* ── Hydrate form from existing config ─────────────── */
  useEffect(() => {
    if (!config) return;
    setIsEnabled(config.isEnabled);
    setKeywords(config.keywords);
    setReplyType(config.replyType);
    setReplyMessage(config.replyMessage);
  }, [config]);

  /* ── Keyword management ────────────────────────────── */
  const addKeyword = (kw: string) => {
    const trimmed = kw.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
    }
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const handleKeywordInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword(keywordInput);
    }
  };

  /* ── Save ──────────────────────────────────────────── */
  const handleSave = async () => {
    if (!replyMessage.trim()) {
      antMessage.warning('Please enter a reply message.');
      return;
    }
    if (keywords.length === 0) {
      antMessage.warning('Add at least one keyword to trigger automation.');
      return;
    }

    const payload: AutomationConfig = {
      accountId,
      keywords,
      replyType,
      replyMessage: replyMessage.trim(),
      isEnabled,
    };

    try {
      await saveConfig(payload);
      antMessage.success('Automation saved successfully!');
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 5000);
    } catch {
      antMessage.error('Failed to save automation. Please try again.');
    }
  };

  /* ── Skeleton while loading ────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-5 max-w-xl">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-5">

      {/* Success banner */}
      {savedOk && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleFilled />}
          message="Automation is Live!"
          description="Replies will fire automatically when a comment matches your keywords."
          className="rounded-xl"
          closable
          onClose={() => setSavedOk(false)}
        />
      )}

      {/* ── Card ── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-6">

        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Title level={5} className="!mb-0 flex items-center gap-2">
              <ThunderboltOutlined className="text-indigo-500" />
              Auto Reply
            </Title>
            <Text type="secondary" className="text-xs">
              Automatically reply to comments matching your keywords
            </Text>
          </div>
          <Switch
            id="automation-enable-switch"
            checked={isEnabled}
            onChange={setIsEnabled}
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
        </div>

        <Divider className="my-0" />

        {/* Keywords */}
        <div className="space-y-3">
          <div>
            <Text strong className="text-sm block mb-1">
              Trigger Keywords
            </Text>
            <Text type="secondary" className="text-xs">
              Replies fire when a comment contains any of these keywords (case-insensitive).
            </Text>
          </div>

          {/* Active keywords */}
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {keywords.length === 0 ? (
              <Text type="secondary" className="text-xs italic">
                No keywords added yet
              </Text>
            ) : (
              keywords.map((kw) => (
                <Tag
                  key={kw}
                  closable
                  onClose={() => removeKeyword(kw)}
                  closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
                  className="rounded-full text-sm px-3 py-0.5 m-0"
                  color="purple"
                >
                  {kw}
                </Tag>
              ))
            )}
          </div>

          {/* Keyword input */}
          <div className="flex gap-2">
            <Input
              id="keyword-input"
              placeholder='Type a keyword and press Enter (e.g. "price")'
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeywordInputKey}
              className="rounded-xl flex-1"
            />
            <Button
              id="add-keyword-btn"
              icon={<PlusOutlined />}
              onClick={() => addKeyword(keywordInput)}
              disabled={!keywordInput.trim()}
              className="rounded-xl"
            >
              Add
            </Button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5">
            <Text type="secondary" className="text-xs w-full">
              Quick add:
            </Text>
            {SUGGESTED_KEYWORDS.filter((k) => !keywords.includes(k)).map((kw) => (
              <button
                key={kw}
                onClick={() => addKeyword(kw)}
                className="text-xs px-2.5 py-1 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors bg-transparent cursor-pointer"
              >
                + {kw}
              </button>
            ))}
          </div>
        </div>

        <Divider className="my-0" />

        {/* Reply type */}
        <div className="space-y-2">
          <Text strong className="text-sm">
            Reply Via
          </Text>
          <Select
            id="reply-type-select"
            value={replyType}
            onChange={(v) => setReplyType(v as 'public' | 'private')}
            options={REPLY_TYPE_OPTIONS}
            className="w-full"
            size="large"
          />
          <Text type="secondary" className="text-xs">
            {replyType === 'private'
              ? 'Sends an automatic Direct Message to the commenter.'
              : 'Posts a public reply under the original comment.'}
          </Text>
        </div>

        <Divider className="my-0" />

        {/* Reply message */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageOutlined className="text-indigo-500" />
            <Text strong className="text-sm">
              Reply Message
            </Text>
          </div>
          <TextArea
            id="reply-message-textarea"
            rows={4}
            placeholder="e.g. Thanks for your interest! Please check your DMs for more details."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            maxLength={500}
            showCount
            className="rounded-xl"
          />
        </div>

        {/* Preview bubble */}
        {replyMessage.trim() && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
            <Text type="secondary" className="text-xs uppercase tracking-wider font-medium block">
              Preview
            </Text>
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#833ab4] to-[#fd1d1d] flex-shrink-0" />
              <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2 shadow-sm border border-gray-100 text-sm text-gray-700 max-w-[75%]">
                {keywords[0] ? `What is the ${keywords[0]}?` : 'Great post! 🔥'}
              </div>
            </div>
            <div className="flex items-end gap-2 flex-row-reverse">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
                <Text className="text-white text-[10px] font-bold">You</Text>
              </div>
              <div className="bg-indigo-600 rounded-2xl rounded-br-none px-4 py-2 shadow-sm text-sm text-white max-w-[75%]">
                {replyMessage}
              </div>
            </div>
            <Text type="secondary" className="text-xs block text-center">
              {replyType === 'private' ? 'Sent via DM (private)' : 'Posted as comment (public)'}
            </Text>
          </div>
        )}

        <Divider className="my-0" />

        {/* Save */}
        <Button
          id="save-automation-config-btn"
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={isSaving}
          disabled={!replyMessage.trim() || keywords.length === 0}
          onClick={handleSave}
          block
          className="h-12 rounded-xl font-semibold text-base shadow-md"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
        >
          {isSaving ? 'Saving…' : 'Save Automation'}
        </Button>
      </div>
    </div>
  );
}
