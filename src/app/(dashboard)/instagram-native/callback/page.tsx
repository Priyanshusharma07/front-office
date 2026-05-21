'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin, Typography } from 'antd';

const { Title, Text } = Typography;

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (code) {
          // POST /instagram-native/connect-account
          await fetch(`${API_URL}/instagram-native/connect-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
        }
      } catch (err) {
        console.error('Error during callback', err);
      } finally {
        router.push('/instagram-native');
      }
    };

    handleCallback();
  }, [searchParams, router, API_URL]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Spin size="large" />
      <Title level={4} className="mt-4">Connecting your Instagram account...</Title>
      <Text>Please wait while we finalize the setup.</Text>
    </div>
  );
}

export default function InstagramNativeCallback() {
  return (
    <Suspense fallback={<Spin size="large" className="flex justify-center mt-10" />}>
      <CallbackHandler />
    </Suspense>
  );
}
