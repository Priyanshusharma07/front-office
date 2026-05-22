import { Suspense } from 'react';
import { App } from 'antd';
import { NativeInstagramFlow } from '@/modules/instagram/native/NativeInstagramFlow';
import { LoadingState } from '@/modules/instagram/native/components/LoadingState';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Connect Instagram Business | BrokerageX',
  description:
    'Connect your Instagram Business account for comment automation, private replies, messaging workflows, and CRM integrations.',
};

export default function InstagramNativePage() {
  return (
    <div className="min-h-[80vh] py-10 px-4">
      <App>
        <Suspense fallback={<LoadingState message="Loading…" />}>
          <NativeInstagramFlow />
        </Suspense>
      </App>
    </div>
  );
}
