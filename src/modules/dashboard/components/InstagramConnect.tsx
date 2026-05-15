'use client';

import React from 'react';
import { Card, Button, Avatar, Badge, Typography, Space, Tooltip } from 'antd';
import { InstagramOutlined, CheckCircleFilled, ExclamationCircleFilled, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockAccounts = [
  { id: '1', username: 'fashion_store_off', avatar: 'https://i.pravatar.cc/150?u=1', status: 'connected' as const, expiryDays: 45 },
  { id: '2', username: 'daily_vlogs_2024', avatar: 'https://i.pravatar.cc/150?u=2', status: 'expired' as const, expiryDays: 0 },
];

export default function InstagramConnect() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={4}>Instagram Accounts</Title>
          <Text type="secondary">Manage your connected Instagram Business accounts.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<InstagramOutlined />} 
          className="bg-gradient-to-r from-purple-600 to-pink-500 border-none hover:opacity-90"
        >
          Connect New Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAccounts.map((account) => (
          <Card key={account.id} className="shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <Space size="middle">
                <Avatar src={account.avatar} size={64} />
                <div>
                  <div className="flex items-center gap-2">
                    <Text strong className="text-lg">@{account.username}</Text>
                    {account.status === 'connected' ? (
                      <CheckCircleFilled className="text-green-500" />
                    ) : (
                      <ExclamationCircleFilled className="text-red-500" />
                    )}
                  </div>
                  <Text type="secondary" className="text-xs">Business Account</Text>
                </div>
              </Space>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div>
                {account.status === 'connected' ? (
                  <Text type="secondary" className="text-xs">Expires in {account.expiryDays} days</Text>
                ) : (
                  <Text type="danger" className="text-xs font-semibold">Token Expired</Text>
                )}
              </div>
              <Button 
                size="small" 
                type={account.status === 'expired' ? 'primary' : 'default'}
                icon={<ReloadOutlined />}
              >
                {account.status === 'expired' ? 'Reconnect' : 'Refresh'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
