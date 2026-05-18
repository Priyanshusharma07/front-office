'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InstagramConnect from '@/modules/instagram/components/InstagramConnect';
import { Spin } from 'antd';

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const oauthSession = searchParams.get('oauthSession');
  return <InstagramConnect oauthSession={oauthSession} />;
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    }>
      <IntegrationsContent />
    </Suspense>
  );
}
