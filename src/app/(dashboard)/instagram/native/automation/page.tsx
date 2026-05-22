import { Suspense } from 'react';
import { App } from 'antd';
import { NativeAutomationFlow } from '@/modules/instagram/native/NativeAutomationFlow';
import { LoadingState } from '@/modules/instagram/native/components/LoadingState';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Instagram Automation | BrokerageX',
  description:
    'Manage Instagram automation rules, keyword-based auto-replies, webhook events, and connection settings for your Instagram Business account.',
};

export default function InstagramAutomationPage() {
  return (
    <div className="min-h-[80vh] py-10 px-4">
      <App>
        <Suspense fallback={<LoadingState message="Loading…" />}>
          <NativeAutomationFlow />
        </Suspense>
      </App>
    </div>
  );
}
