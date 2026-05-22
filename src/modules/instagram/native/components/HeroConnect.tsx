'use client';

import React from 'react';
import { Button, Typography } from 'antd';
import {
  InstagramOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const FEATURES = [
  {
    icon: <MessageOutlined className="text-xl text-white" />,
    title: 'Auto-Reply to Comments',
    description: 'Instantly respond to comments with personalized messages',
    gradient: 'from-[#833ab4] to-[#9c27b0]',
  },
  {
    icon: <ThunderboltOutlined className="text-xl text-white" />,
    title: 'DM Automation',
    description: 'Send automatic DMs when users comment specific keywords',
    gradient: 'from-[#fd1d1d] to-[#e91e63]',
  },
  {
    icon: <SafetyOutlined className="text-xl text-white" />,
    title: 'Secure Connection',
    description: 'Direct Instagram login — no Facebook Page required',
    gradient: 'from-[#fcb045] to-[#ff9800]',
  },
];

const PERMISSIONS = [
  'Read and respond to comments on your posts',
  'Send and receive direct messages',
  'Access basic profile information',
  'View post insights and engagement',
];

interface HeroConnectProps {
  onConnect: () => void;
}

export function HeroConnect({ onConnect }: HeroConnectProps) {
  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0533] via-[#3d0b6b] to-[#1a0533] shadow-2xl p-10 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#833ab4] opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#fd1d1d] opacity-15 blur-3xl" />

        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-lg shadow-purple-900/40">
            <InstagramOutlined className="text-5xl text-white" />
          </div>
        </div>

        <Title level={2} className="!text-white !mb-3 text-center">
          Connect Instagram Business
        </Title>
        <Paragraph className="text-purple-200 text-center max-w-sm mx-auto !mb-10">
          Connect your Instagram Business account to unlock powerful automation features
        </Paragraph>

        {/* CTA */}
        <div className="flex justify-center">
          <Button
            id="instagram-native-connect-btn"
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={onConnect}
            className="h-12 px-10 rounded-xl font-semibold text-base shadow-lg shadow-purple-900/50"
            style={{
              background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
              border: 'none',
            }}
          >
            Connect Instagram
          </Button>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center`}
            >
              {f.icon}
            </div>
            <Text strong className="block text-sm text-gray-900">
              {f.title}
            </Text>
            <Text type="secondary" className="text-xs leading-relaxed">
              {f.description}
            </Text>
          </div>
        ))}
      </div>

      {/* Permissions notice */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
        <Text strong className="text-xs text-gray-500 uppercase tracking-wider block mb-3">
          By connecting, you&apos;ll grant access to:
        </Text>
        <ul className="space-y-2">
          {PERMISSIONS.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
