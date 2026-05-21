import { Suspense } from 'react';
import InstagramCallback from '@/modules/instagram/components/InstagramCallback';
import InstagramPageContent from '@/components/instagram-connector/InstagramPageContent';
import { App } from 'antd';

export const dynamic = 'force-dynamic';

export default async function InstagramPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  console.log('INSTAGRAM_PAGE_LOADED');
  
  const params = await searchParams;
  
  // Detect old style callback logic to support backward compatibility
  const isOldCallback = params.success || params.error || params.session || params.code;
  
  if (isOldCallback && !params.status) {
    console.log('CALLBACK_DETECTED');
    return <InstagramCallback />;
  }

  console.log('CONNECT_SCREEN_RENDERED');
  return (
    <div suppressHydrationWarning>
      <App>
        <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
          <InstagramPageContent />
        </Suspense>
      </App>
    </div>
  );
}
