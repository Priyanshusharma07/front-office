'use client';

import React from 'react';
import { Typography, Button, Tag } from 'antd';
import {
  InstagramOutlined,
  CheckCircleOutlined,
  LockOutlined,
  ThunderboltOutlined,
  MessageOutlined,
} from '@ant-design/icons';

import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const { Title, Text, Paragraph } = Typography;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const STEPS = [
  { icon: <InstagramOutlined />, label: 'Connect Instagram', desc: 'Authenticate via Meta OAuth' },
  { icon: <CheckCircleOutlined />, label: 'Account Verified', desc: 'Your business account is linked' },
  { icon: <ThunderboltOutlined />, label: 'Configure Triggers', desc: 'Set comment automation rules' },
  { icon: <MessageOutlined />, label: 'Enable Private Reply', desc: 'Auto-respond to comments via DM' },
];

const PERMISSIONS = [
  'instagram_basic',
  'instagram_manage_comments',
  'instagram_manage_messages',
  'pages_show_list',
  'pages_read_engagement',
];

export default function InstagramStartScreen() {
  const pathname = usePathname();
  const { user: currentUser } = useUser();

  const handleConnectClick = () => {
    console.log('INSTAGRAM_CONNECT_CLICKED');
    console.log('BACKEND_REDIRECT_STARTED');
    console.log('REDIRECT_URL:', `${API_URL}/instagram/connect-instagram`);
    
    // Validation logging before redirect
    console.log(API_URL);
    console.log(currentUser);
    console.log(pathname);

    window.location.href = `${API_URL}/instagram/connect-instagram`;
  };

  const handleNativeBusinessLogin = () => {
    console.log('BUSINESS_LOGIN_STARTED');
    console.log('ASSET_SELECTION_STARTED');
    window.location.href = `${API_URL}/instagram/native/business-login`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
            <InstagramOutlined className="text-3xl text-white" />
          </div>
          <div>
            <Title level={3} className="!mb-0">Instagram Integration</Title>
            <Text type="secondary" className="text-sm">
              Connect your Instagram Business account to enable automated private replies
            </Text>
          </div>
        </div>
        <Tag
          color="warning"
          className="rounded-full px-4 py-1 text-sm font-medium border-amber-200 bg-amber-50 text-amber-700"
        >
          ● Not Connected
        </Tag>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Native connection card ────────────────────────────── */}
        <div className="rounded-3xl border-2 border-dashed border-pink-200 bg-gradient-to-b from-pink-50/60 to-white p-10 text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-pink-500 to-rose-500">
              <InstagramOutlined className="text-4xl text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Title level={4} className="!mb-0">Instagram Business Connector</Title>
            <Paragraph type="secondary" className="text-sm !mb-0">
              Connect Instagram for comments, private replies, and CRM automation.
            </Paragraph>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<LockOutlined />}
            onClick={handleNativeBusinessLogin}
            className="w-full text-base font-semibold rounded-xl shadow-md bg-gradient-to-r from-pink-500 to-rose-500 border-none h-12"
          >
            Connect Instagram Business
          </Button>
          <Text type="secondary" className="text-xs block">
            Direct Meta Business Login integration
          </Text>
        </div>

        {/* ── Main connection card ────────────────────────────── */}
        <div className="rounded-3xl border-2 border-dashed border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white p-10 text-center space-y-6">

        {/* Instagram gradient icon */}
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
            <InstagramOutlined className="text-5xl text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <Title level={3} className="!mb-0">Connect your Instagram Business Account</Title>
          <Paragraph type="secondary" className="max-w-lg mx-auto text-base !mb-0">
            Link your Instagram Business profile so BrokerageX can listen for comments
            and automatically send private replies to your customers.
          </Paragraph>
        </div>

        {/* Flow steps */}
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2 max-w-[110px]">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-semibold">
                  {i + 1}
                </div>
                <Text className="text-xs text-gray-600 text-center leading-tight font-medium">{step.label}</Text>
                <Text className="text-[11px] text-gray-400 text-center leading-tight hidden sm:block">{step.desc}</Text>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-indigo-200 mb-8 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* CTA button */}
        <Button
          type="primary"
          size="large"
          icon={<LockOutlined />}
          onClick={handleConnectClick}
          className="h-13 px-10 text-base font-semibold rounded-xl shadow-lg !flex items-center gap-2 mx-auto"
          style={{
            background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
            border: 'none',
            height: 52,
          }}
        >
          Connect Instagram
        </Button>
        <Text type="secondary" className="text-xs block">
          You will be redirected to Meta for authentication
        </Text>
      </div>
      </div>

      {/* ── Permissions info ────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <Text strong className="text-gray-700 block mb-4 text-sm uppercase tracking-wider">
          Required Permissions
        </Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PERMISSIONS.map(perm => (
            <div key={perm} className="flex items-center gap-2 text-sm">
              <CheckCircleOutlined className="text-emerald-500 flex-shrink-0" />
              <code className="text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg font-mono">
                {perm}
              </code>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
