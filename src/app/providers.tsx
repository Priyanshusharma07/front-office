'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App } from 'antd';
import { ReactNode, useState } from 'react';
import { themeConfig } from '@/constants/theme';
import { SocketProvider } from '@/modules/websocket/SocketProvider';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={themeConfig}>
        <App>
          <SocketProvider>
            {children}
          </SocketProvider>
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}


