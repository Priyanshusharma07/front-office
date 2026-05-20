'use client';

import React from 'react';
import { Card, Avatar, Typography, Tag } from 'antd';
import { InstagramOutlined, CheckCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

interface InstagramUserCardProps {
  username: string;
  profilePicture?: string;
  isConnected: boolean;
}

export default function InstagramUserCard({ username, profilePicture, isConnected }: InstagramUserCardProps) {
  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden w-full max-w-sm">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <Avatar
            src={profilePicture || `https://ui-avatars.com/api/?name=${username}&background=e0e7ff&color=4f46e5&bold=true`}
            size={64}
            className="border-2 border-indigo-100"
            icon={!profilePicture && <InstagramOutlined />}
          />
          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isConnected ? 'bg-emerald-500' : 'bg-gray-300'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Title level={5} className="!mb-0 text-gray-900 truncate">@{username}</Title>
          </div>
          <div className="mt-1">
            {isConnected ? (
              <Tag color="success" icon={<CheckCircleFilled />} className="m-0 border-none bg-emerald-50 text-emerald-600 rounded-full">Connected</Tag>
            ) : (
              <Tag color="default" icon={<ExclamationCircleFilled />} className="m-0 border-none bg-gray-50 text-gray-500 rounded-full">Disconnected</Tag>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
