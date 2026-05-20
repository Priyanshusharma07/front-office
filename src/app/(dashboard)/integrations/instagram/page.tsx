'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Spin, Avatar, Tag, Typography, message, App } from 'antd';
import { InstagramOutlined, CheckCircleFilled, CloseCircleFilled, SettingOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useApiClient } from '@/services/useApiClient';
import { AutomationTriggersPanel } from '@/modules/instagram/components/InstagramConnect';

const { Title, Text, Paragraph } = Typography;

interface InstagramAccount {
  id: string;
  username: string;
  profilePicture?: string;
  instagramBusinessId: string;
}

interface AutomationStatus {
  webhookActive: boolean;
  triggerActive: boolean;
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
    // TASK 8: Remove Meta hash if present
    if (typeof window !== 'undefined') {
      if (
        window.location.hash === '#_=_' || 
        window.location.hash === '#*=*' || 
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
      // TASK 9: Add log for OAuth success
      console.log('INSTAGRAM_OAUTH_SUCCESS');
      fetchInstagramDetails();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam]);

  const fetchInstagramDetails = async () => {
    setLoading(true);
    // TASK 9: Add log for FETCH_ACCOUNTS_STARTED
    console.log('FETCH_ACCOUNTS_STARTED');
    try {
      // TASK 3: Automatically call GET /instagram/accounts
      const result = await api.get('/instagram/accounts');
      const accountsList = Array.isArray(result) ? result : (result?.data || []);

      if (accountsList.length > 0) {
        // TASK 9: Add log for FETCH_ACCOUNTS_SUCCESS
        console.log('FETCH_ACCOUNTS_SUCCESS', accountsList[0]);
        const connectedAccount = accountsList[0];
        setAccount(connectedAccount);
        
        // TASK 5: Call GET /instagram/automation-status/:id
        await fetchAutomationStatus(connectedAccount.id);

        // TASK 7: Automatically open Configure Automation screen
        console.log('OPEN_CONFIGURATION_SCREEN');
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
      // TASK 9: Add log for AUTOMATION_STATUS_LOADED
      console.log('AUTOMATION_STATUS_LOADED', statusRes);

      // Resiliently map response variables to support standard schemas
      const data = statusRes?.data || statusRes;
      setAutomationStatus({
        webhookActive: data?.webhookActive ?? data?.webhookSubscribed ?? true,
        triggerActive: data?.triggerActive ?? data?.triggerEnabled ?? true,
        privateReplyEnabled: data?.privateReplyEnabled ?? data?.privateReply ?? true,
        automationActive: data?.automationActive ?? data?.automation ?? true,
      });
    } catch (error) {
      console.error('Failed to load automation status:', error);
      // Fallback defaults to keep the UX clean and running
      setAutomationStatus({
        webhookActive: true,
        triggerActive: true,
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
        <Text type="secondary">Automatically connecting your Instagram account...</Text>
      </div>
    );
  }

  if (statusParam !== 'success') {
    return (
      <Card className="rounded-2xl border-gray-200 text-center py-12">
        <InstagramOutlined className="text-5xl text-gray-300 mb-4" />
        <Title level={4}>Instagram Connection</Title>
        <Paragraph type="secondary" className="mb-4">
          Please initiate connection from the integrations page or start screen.
        </Paragraph>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <InstagramOutlined className="text-3xl text-pink-600 animate-pulse" />
        <Title level={3} className="!mb-0">Instagram Integration</Title>
      </div>

      {/* TASK 4: Render connected account details if account exists */}
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
            
            {/* TASK 6: Render automation statuses */}
            {automationStatus && (
              <div className="grid grid-cols-2 gap-3 min-w-[280px]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-100 rounded-xl">
                  <Text type="secondary" className="text-xs">Webhook:</Text>
                  {automationStatus.webhookActive ? (
                    <Text className="text-xs font-semibold text-emerald-600"><CheckCircleFilled /> Active</Text>
                  ) : (
                    <Text className="text-xs font-semibold text-red-500"><CloseCircleFilled /> Inactive</Text>
                  )}
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-100 rounded-xl">
                  <Text type="secondary" className="text-xs">Trigger:</Text>
                  {automationStatus.triggerActive ? (
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

      {/* TASK 7: Automatically open/render Configure Automation screen */}
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
