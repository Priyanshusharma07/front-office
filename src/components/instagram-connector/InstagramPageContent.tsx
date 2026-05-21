'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Spin, Avatar, Tag, Typography, Button, message, App } from 'antd';
import { InstagramOutlined, CheckCircleFilled, CloseCircleFilled, SettingOutlined, LockOutlined, ExclamationCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { useApiClient } from '@/services/useApiClient';
import { AutomationTriggersPanel } from '@/modules/instagram/components/InstagramConnect';
import InstagramStartScreen from './InstagramStartScreen';

const { Title, Text, Paragraph } = Typography;

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

export default function InstagramPageContent() {
  const searchParams = useSearchParams();
  const api = useApiClient();
  
  const statusParam = searchParams.get('status');
  const messageParam = searchParams.get('message');
  const accountIdParam = searchParams.get('accountId');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [disconnected, setDisconnected] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);
  const { modal } = App.useApp();

  useEffect(() => {
    // TASK 4: Remove Meta hash
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#*=*') {
        history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
      }
    }

    if (statusParam === 'success') {
      // TASK 5: Add log for INSTAGRAM_CALLBACK_RECEIVED
      console.log('INSTAGRAM_CALLBACK_RECEIVED');
      handleSuccessCallback();
    } else if (statusParam === 'error') {
      setError(messageParam || 'An unknown error occurred during Instagram login.');
      setLoading(false);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam, messageParam, accountIdParam]);

  const handleSuccessCallback = async () => {
    setLoading(true);
    setError(null);
    
    // TASK 5: Add log for ACCOUNT_FETCH_STARTED
    console.log('ACCOUNT_FETCH_STARTED');
    
    try {
      // 1. Call GET /instagram/accounts
      const result = await api.get('/instagram/accounts');
      const accountsList = Array.isArray(result) ? result : (result?.data || []);

      if (accountsList.length > 0) {
        const connectedAccount = accountsList[0];
        // TASK 5: Add log for ACCOUNT_FETCH_SUCCESS
        console.log('ACCOUNT_FETCH_SUCCESS', connectedAccount);
        setAccount(connectedAccount);

        // 2. Call POST /instagram/connect-account
        console.log('AUTOMATION_SETUP_STARTED');
        try {
          await api.post('/instagram/connect-account', {
            accountId: accountIdParam || connectedAccount.id,
            instagramBusinessId: connectedAccount.instagramBusinessId
          });
        } catch (postErr) {
          console.warn('POST /instagram/connect-account call finished with warning:', postErr);
        }

        // 3. Call GET /instagram/automation-status/:id
        await fetchAutomationStatus(connectedAccount.id);

        // TASK 8: Automatically open Configure Automation screen
        setShowConfig(true);
      } else {
        setError('No connected Instagram accounts were found.');
      }
    } catch (err: any) {
      console.error('Failed to handle Instagram callback details:', err);
      setError(err?.message || 'Failed to complete Instagram connection setup.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAutomationStatus = async (accountId: string) => {
    try {
      const statusRes: any = await api.get(`/instagram/account-status/${accountId}`);
      console.log('ACCOUNT_STATUS_FETCHED', statusRes);

      const data = statusRes?.data || statusRes;
      setAutomationStatus({
        webhookActive: data?.webhookActive ?? data?.webhookSubscribed ?? true,
        privateReplyEnabled: data?.privateReplyEnabled ?? data?.privateReply ?? true,
        automationActive: data?.automationActive ?? data?.automation ?? true,
      });
    } catch (error) {
      console.error('Failed to load automation status:', error);
      // Fallback values
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

  const handleDisconnect = () => {
    console.log('DISCONNECT_CLICKED');
    modal.confirm({
      title: 'Disconnect Instagram Account?',
      content: 'Disconnecting will disable automations and remove access tokens.',
      okText: 'Disconnect',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDisconnecting(true);
          await api.post('/instagram/disconnect-account', { accountId: account?.id });
          console.log('DISCONNECT_SUCCESS');
          setDisconnected(true);
          setShowConfig(false);
          message.success('Account disconnected successfully.');
        } catch (err) {
          console.error(err);
          message.error('Failed to disconnect account');
        } finally {
          setDisconnecting(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Spin size="large" />
        <Text type="secondary">{disconnecting ? 'Disconnecting...' : 'Fetching account...'}</Text>
      </div>
    );
  }

  // Handle status="error"
  if (error) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="rounded-2xl border-red-100 bg-red-50/30 shadow-sm text-center py-12 space-y-4">
          <ExclamationCircleFilled className="text-5xl text-red-500" />
          <div className="space-y-1">
            <Title level={4} className="!mb-0 text-red-600">Connection Failed</Title>
            <Text type="secondary" className="text-sm block px-4">
              {error}
            </Text>
          </div>
          <Button 
            type="primary"
            icon={<ReloadOutlined />} 
            onClick={() => {
              window.location.href = '/instagram';
            }} 
            className="rounded-xl mt-4 bg-red-600 hover:bg-red-700 border-none"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Handle status="success"
  if (statusParam === 'success' && account) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <InstagramOutlined className="text-3xl text-pink-600" />
          <Title level={3} className="!mb-0">Instagram Integration</Title>
        </div>

        {/* TASK 5: Render username, profile picture, connected status */}
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
                  {disconnected ? (
                    <Tag color="error" icon={<CloseCircleFilled />} className="rounded-full px-3 m-0 font-medium">Connected ❌</Tag>
                  ) : (
                    <Tag color="success" icon={<CheckCircleFilled />} className="rounded-full px-3 m-0 font-medium">✓ Connected</Tag>
                  )}
                  <Text type="secondary" className="text-xs">ID: {account.instagramBusinessId}</Text>
                </div>
              </div>
            </div>
            
            {/* TASK 7: Render Webhook, Private Reply, Automation statuses */}
            {automationStatus && (
              <div className="grid grid-cols-1 gap-2 min-w-[200px]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-100 rounded-xl">
                  <Text type="secondary" className="text-xs">Webhook:</Text>
                  {disconnected || !automationStatus.webhookActive ? (
                    <Text className="text-xs font-semibold text-red-500"><CloseCircleFilled /> Inactive</Text>
                  ) : (
                    <Text className="text-xs font-semibold text-emerald-600"><CheckCircleFilled /> Active</Text>
                  )}
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-100 rounded-xl">
                  <Text type="secondary" className="text-xs">Private Reply:</Text>
                  {disconnected || !automationStatus.privateReplyEnabled ? (
                    <Text className="text-xs font-semibold text-red-500"><CloseCircleFilled /> Disabled</Text>
                  ) : (
                    <Text className="text-xs font-semibold text-emerald-600"><CheckCircleFilled /> Enabled</Text>
                  )}
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-100 rounded-xl">
                  <Text type="secondary" className="text-xs">Automation:</Text>
                  {disconnected || !automationStatus.automationActive ? (
                    <Text className="text-xs font-semibold text-red-500"><CloseCircleFilled /> Disabled</Text>
                  ) : (
                    <Text className="text-xs font-semibold text-emerald-600"><CheckCircleFilled /> Active</Text>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            {disconnected ? (
              <Button type="primary" onClick={() => window.location.href = '/instagram'}>Connect Instagram</Button>
            ) : (
              <Button danger loading={disconnecting} onClick={handleDisconnect}>Disconnect Account</Button>
            )}
          </div>
        </Card>

        {/* TASK 8: Automatically open/render Configure Automation triggers screen */}
        {showConfig && (
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

  // Default: Onboarding Start Screen
  return <InstagramStartScreen />;
}
