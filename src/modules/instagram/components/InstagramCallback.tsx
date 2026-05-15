'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Typography } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(4);

  const success = searchParams.get('success') === 'true';
  const rawError = searchParams.get('error');
  const errorMsg = rawError ? decodeURIComponent(rawError) : null;

  useEffect(() => {
    const token = searchParams.get('token');
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          if (success && token) {
            router.replace(`/instagram/select?token=${token}`);
          } else {
            router.replace('/integrations');
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [router, searchParams, success]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4" suppressHydrationWarning>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden" suppressHydrationWarning>

        {/* Gradient top bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" />

        <div className="p-10 text-center space-y-6">
          {success ? (
            <>
              {/* Success icon */}
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <CheckCircleFilled className="text-5xl text-emerald-500" />
              </div>

              <div>
                <Title level={3} className="!mb-2">Account Connected! 🎉</Title>
                <Paragraph type="secondary" className="!mb-0">
                  Your Instagram Business account has been successfully linked and
                  webhook subscriptions are now active.
                </Paragraph>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-left space-y-2">
                {['Comment detection is live', 'Webhook subscriptions active', 'Automations ready to configure'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircleFilled className="text-emerald-500 text-xs flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Error icon */}
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <CloseCircleFilled className="text-5xl text-red-400" />
              </div>

              <div>
                <Title level={3} className="!mb-2">Connection Failed</Title>
                <Paragraph type="secondary" className="!mb-0">
                  {errorMsg || 'Something went wrong during the Instagram OAuth process. Please try again.'}
                </Paragraph>
              </div>
            </>
          )}

          {/* Countdown */}
          <Text type="secondary" className="text-sm block">
            Redirecting in{' '}
            <span className="font-bold text-indigo-600">{countdown}s</span>…
          </Text>

          <div className="flex gap-3 justify-center">
            {success && searchParams.get('token') ? (
              <Button
                type="primary"
                onClick={() => router.replace(`/instagram/select?token=${searchParams.get('token')}`)}
              >
                Select Instagram Page
              </Button>
            ) : (
              <Button type="primary" onClick={() => router.replace('/integrations')}>
                Go to Integrations
              </Button>
            )}
            {!success && (
              <Button onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/instagram/connect`; }}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstagramCallback() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}
