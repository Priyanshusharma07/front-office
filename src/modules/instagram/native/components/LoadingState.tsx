'use client';

import React from 'react';
import { Typography, Spin } from 'antd';
import { InstagramOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-lg animate-pulse">
        <InstagramOutlined className="text-3xl text-white" />
      </div>
      <Spin size="large" />
      <Text type="secondary" className="text-sm">{message}</Text>
    </div>
  );
}
