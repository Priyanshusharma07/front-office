'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Space, Spin, Tag, message } from 'antd';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function InstagramNativeDashboard() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<any>(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      console.log('ACCOUNT_FETCHED log...');
      const res = await fetch(`${API_URL}/instagram-native/accounts`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setAccount(data[0]);
          await fetchStatus(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch account', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async (accountId: string) => {
    try {
      const res = await fetch(`${API_URL}/instagram-native/status/${accountId}`);
      if (res.ok) {
        const data = await res.json();
        setAccount((prev: any) => ({ ...prev, statusData: data }));
      }
    } catch (err) {
      console.error('Failed to fetch status', err);
    }
  };

  const handleConnectClick = () => {
    console.log('INSTAGRAM_NATIVE_CONNECT_CLICKED');
    window.location.href = `${API_URL}/instagram-native/connect`;
  };

  const connectCRM = async () => {
    console.log('CRM_CONNECTED');
    message.success('CRM Connected');
    fetchAccount();
  };

  if (loading) return <Spin size="large" className="flex justify-center mt-10" />;

  return (
    <div className="p-6">
      <Title level={2}>Instagram Native Dashboard</Title>
      
      {!account ? (
        <Card className="mt-6 w-1/2">
          <div className="flex flex-col items-center py-10">
            <Text className="mb-4">No Instagram account connected.</Text>
            <Button type="primary" onClick={handleConnectClick}>
              Connect Instagram
            </Button>
          </div>
        </Card>
      ) : (
        <Space direction="vertical" size="large" className="w-full">
          <Card title="Connected Account">
            <p><Text strong>Username:</Text> {account.username}</p>
            <p><Text strong>Token Expiration:</Text> {account.tokenExpiration || 'Never'}</p>
            <p>
              <Text strong>CRM Status: </Text>
              <Tag color="green">Connected</Tag>
            </p>
            <p>
              <Text strong>Webhook Status: </Text> 
              <Tag color={account.statusData?.webhook ? 'green' : 'red'}>
                {account.statusData?.webhook ? 'Active' : 'Inactive'}
              </Tag>
            </p>
            <p>
              <Text strong>Automation Status: </Text>
              <Tag color={account.statusData?.automation ? 'green' : 'red'}>
                {account.statusData?.automation ? 'Active' : 'Inactive'}
              </Tag>
            </p>
            <Space className="mt-4">
              <Button onClick={connectCRM}>Refresh CRM State</Button>
              <Button type="primary" onClick={() => router.push('/instagram-native/automation')}>
                Configure Automation
              </Button>
              <Button onClick={() => router.push('/instagram-native/private-reply')}>
                Private Reply Settings
              </Button>
            </Space>
          </Card>
        </Space>
      )}
    </div>
  );
}
