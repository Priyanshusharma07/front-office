import { Suspense } from 'react';
import InstagramConnect from '@/modules/instagram/components/InstagramConnect';
import { Spin } from 'antd';

export const metadata = {
  title: 'Integrations – BrokerageX',
  description: 'Connect your Instagram Business accounts to enable automated replies.',
};

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    }>
      <InstagramConnect />
    </Suspense>
  );
}
