import { Suspense } from 'react';
import InstagramCallback from '@/modules/instagram/components/InstagramCallback';
import InstagramStartScreen from '@/components/instagram-connector/InstagramStartScreen';

export const dynamic = 'force-dynamic';

export default async function InstagramPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  console.log('INSTAGRAM_PAGE_LOADED');
  
  const params = await searchParams;
  
  const isCallback = params.success || params.error || params.session || params.code;
  
  if (isCallback) {
    console.log('CALLBACK_DETECTED');
    return <InstagramCallback />;
  }

  console.log('CONNECT_SCREEN_RENDERED');
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <InstagramStartScreen />
    </Suspense>
  );
}
