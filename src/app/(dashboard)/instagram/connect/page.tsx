import { Suspense } from 'react';
import InstagramConnectScreen from '@/components/instagram-connector/InstagramConnectScreen';

export const dynamic = 'force-dynamic';

export default function InstagramConnectPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading connection flow...</div>}>
      <InstagramConnectScreen />
    </Suspense>
  );
}
