'use client';

import React from 'react';
import { Button, Typography } from 'antd';
import { ExclamationCircleFilled, ReloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-6 max-w-sm mx-auto">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center shadow-sm">
        <ExclamationCircleFilled className="text-5xl text-red-400" />
      </div>

      {/* Text */}
      <div>
        <Title level={4} className="!mb-2">
          {title}
        </Title>
        <Paragraph type="secondary" className="!mb-0 text-sm">
          {message}
        </Paragraph>
      </div>

      {/* Retry */}
      <Button
        type="primary"
        icon={<ReloadOutlined />}
        onClick={onRetry}
        size="large"
        className="rounded-xl px-8"
        style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d)', border: 'none' }}
      >
        Try Again
      </Button>
    </div>
  );
}
