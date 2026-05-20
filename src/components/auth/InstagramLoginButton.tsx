'use client';

import React from 'react';
import { Button } from 'antd';
import { InstagramOutlined } from '@ant-design/icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function InstagramLoginButton() {
  const handleLogin = () => {
    console.log('AUTH_START: Initiating Instagram login');
    window.location.href = `${API_URL}/instagram/auth`;
  };

  return (
    <Button
      type="primary"
      size="large"
      icon={<InstagramOutlined />}
      onClick={handleLogin}
      style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', border: 'none' }}
      className="shadow-lg px-8 flex items-center justify-center rounded-xl h-12 text-base font-semibold transition-all hover:scale-[1.02]"
    >
      Continue with Instagram
    </Button>
  );
}
