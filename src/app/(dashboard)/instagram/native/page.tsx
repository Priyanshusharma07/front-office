import { Suspense } from 'react';
import NativeInstagramFlow from '@/modules/instagram/native/NativeInstagramFlow';
import { Spin } from 'antd';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Connect Instagram Business | BrokerageX',
  description:
    'Connect your Instagram Business account for comment automation, private replies, messaging workflows, and CRM integrations.',
};

export default function InstagramNativePage() {
  return (
    <div className="min-h-[80vh] py-10 px-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24">
            <Spin size="large" />
          </div>
        }
      >
        <NativeInstagramFlow />
      </Suspense>
    </div>
  );
}
