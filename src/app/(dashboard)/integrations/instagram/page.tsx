'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Spin, Avatar, Tag, Typography, Button, message, App } from 'antd';
import { InstagramOutlined, CheckCircleFilled, CloseCircleFilled, SettingOutlined, LockOutlined } from '@ant-design/icons';
import { useApiClient } from '@/services/useApiClient';
import { AutomationTriggersPanel } from '@/modules/instagram/components/InstagramConnect';

const { Title, Text, Paragraph } = Typography;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface InstagramAccount {
  id: string;
  username: string;
  profilePicture?: string;
  instagramBusinessId: string;
}

interface AutomationStatus {
  webhookActive: boolean;
  privateReplyEnabled: boolean;
  automationActive: boolean;
}

function InstagramIntegrationContent() {
  const searchParams = useSearchParams();
  const api = useApiClient();
  
  const statusParam = searchParams.get('status');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  useEffect(() => {
    // TASK 9: Remove Meta hash
    if (typeof window !== 'undefined') {
      if (
        window.location.hash === '#*=*' || 
        window.location.hash === '#_=_' || 
        window.location.hash.includes('_=_') || 
        window.location.hash.includes('*=*')
      ) {
        history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
      }
    }

    if (statusParam === 'success') {
      fetchInstagramDetails();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam]);

  const handleConnectClick = () => {
    // TASK 10: Log connect action and oauth start
    console.log('INSTAGRAM_CONNECT_CLICKED');
    console.log('OAUTH_STARTED');
    
    // TASK 3: Button action redirect
    window.location.href = `${API_URL}/instagram/connect-instagram`;
  };

  const fetchInstagramDetails = async () => {
    setLoading(true);
    // TASK 10: Log fetch start
    console.log('ACCOUNT_FETCH_STARTED');
    try {
      // TASK 4: Call GET /instagram/accounts
      const result = await api.get('/instagram/accounts');
      const accountsList = Array.isArray(result) ? result : (result?.data || []);

      if (accountsList.length > 0) {
        const connectedAccount = accountsList[0];
        // TASK 10: Log fetch success
        console.log('ACCOUNT_FETCH_SUCCESS', connectedAccount);
        setAccount(connectedAccount);
        
        // TASK 6: Call GET /instagram/automation-status/:id
        await fetchAutomationStatus(connectedAccount.id);

        // TASK 8: Automatically open Configure Automation screen
        setShowConfig(true);
      } else {
        message.warning('No connected Instagram account found.');
      }
    } catch (error) {
      console.error('Failed to fetch Instagram accounts:', error);
      message.error('Failed to load connected accounts.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAutomationStatus = async (accountId: string) => {
    try {
      const statusRes: any = await api.get(`/instagram/automation-status/${accountId}`);
      // TASK 10: Log automation status loaded
      console.log('AUTOMATION_STATUS_LOADED', statusRes);

      const data = statusRes?.data || statusRes;
      setAutomationStatus({
        webhookActive: data?.webhookActive ?? data?.webhookSubscribed ?? true,
        privateReplyEnabled: data?.privateReplyEnabled ?? data?.privateReply ?? true,
        automationActive: data?.automationActive ?? data?.automation ?? true,
      });
    } catch (error) {
      console.error('Failed to load automation status:', error);
      // Fallback defaults
      setAutomationStatus({
        webhookActive: true,
        privateReplyEnabled: true,
        automationActive: true,
      });
    }
  };

  const handleTriggersSaved = () => {
    message.success('Automation updated successfully!');
    if (account) {
      fetchAutomationStatus(account.id);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Spin size="large" />
        <Text type="secondary">Processing connection...</Text>
      </div>
    );
  }

  // TASK 2: Initial Connection Screen
  if (statusParam !== 'success') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
            <InstagramOutlined className="text-2xl text-white" />
          </div>
          <div>
            <Title level={3} className="!mb-0">Connect Instagram</Title>
            <Text type="secondary" className="text-sm">
              Connect your Instagram professional account and automate comments, messages and private replies.
            </Text>
          </div>
        </div>

        <Card className="rounded-3xl border-2 border-dashed border-indigo-100 bg-gradient-to-b from-indigo-50/30 to-white p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-md bg-white border border-gray-100">
              <InstagramOutlined className="text-4xl text-pink-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <Title level={4}>Integrate Instagram-Native Automations</Title>
            <Paragraph type="secondary" className="max-w-md mx-auto">
              Boost user engagement instantly by triggering comment auto-responses and direct message flows.
            </Paragraph>
          </div>
          <Button 
            type="primary" 
            size="large" 
            icon={<LockOutlined />}
            onClick={handleConnectClick} 
            className="h-12 px-8 text-base font-semibold rounded-xl shadow-md border-none"
            style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
          >
            Connect Instagram
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <InstagramOutlined className="text-3xl text-pink-600" />
        <Title level={3} className="!mb-0">Instagram Integration</Title>
      </div>

      {/* TASK 5: Render connected account details */}
      {account && (
        <Card className="rounded-2xl border-gray-200 shadow-sm p-6 bg-gradient-to-r from-purple-50/50 via-white to-pink-50/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar 
                size={72} 
                src={account.profilePicture || `https://ui-avatars.com/api/?name=${account.username}&background=e0e7ff&color=4f46e5&bold=true`}
                icon={<InstagramOutlined />}
                className="border-2 border-white shadow-sm"
              />
              <div>
                <Title level={4} className="!mb-1">@{account.username}</Title>
                <div className="flex items-center gap-2">
                  <Tag color="success" icon={<CheckCircleFilled />} className="rounded-full px-3 m-0 font-medium">✓ Connected</Tag>
                  <Text type="secondary" className="text-xs">ID: {account.instagramBusinessId}</Text>
                </div>
              </div>
            </div>
            
            {/* TASK 7: Render automation statuses (Webhook, Private Reply, Automation) */}
            {automationStatus && (
              <div className="grid grid-cols-1 gap-2 min-w-[200px]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-100 rounded-xl">
                  <Text type="secondary" className="text-xs">Webhook:</Text>
                  {automationStatus.webhookActive ? (
                    <Text className="text-xs font-semibold text-emerald-600"><CheckCircleFilled /> Active</Text>
                  ) : (
                    <Text className="text-xs font-semibold text-red-500"><CloseCircleFilled /> Inactive</Text>
                  )}
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-100 rounded-xl">
                  <Text type="secondary" className="text-xs">Private Reply:</Text>
                  {automationStatus.privateReplyEnabled ? (
                    <Text className="text-xs font-semibold text-emerald-600"><CheckCircleFilled /> Enabled</Text>
                  ) : (
                    <Text className="text-xs font-semibold text-red-500"><CloseCircleFilled /> Disabled</Text>
                  )}
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-100 rounded-xl">
                  <Text type="secondary" className="text-xs">Automation:</Text>
                  {automationStatus.automationActive ? (
                    <Text className="text-xs font-semibold text-emerald-600"><CheckCircleFilled /> Active</Text>
                  ) : (
                    <Text className="text-xs font-semibold text-red-500"><CloseCircleFilled /> Disabled</Text>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TASK 8: Automatically open/render Configure Automation screen */}
      {showConfig && account && (
        <Card 
          className="rounded-2xl border-gray-200 shadow-sm p-6"
          title={
            <span className="flex items-center gap-2 text-indigo-600">
              <SettingOutlined /> Configure Comment Automation
            </span>
          }
        >
          <AutomationTriggersPanel 
            instagramBusinessId={account.instagramBusinessId}
            oauthSession=""
            onNext={handleTriggersSaved}
          />
        </Card>
      )}
    </div>
  );
}

export default function InstagramIntegrationPage() {
  return (
    <App suppressHydrationWarning>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      }>
        <InstagramIntegrationContent />
      </Suspense>
    </App>
  );
}
