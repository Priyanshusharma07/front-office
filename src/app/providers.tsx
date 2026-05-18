'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App } from 'antd';
import { ReactNode, useState } from 'react';
import { themeConfig } from '@/constants/theme';
import { SocketProvider } from '@/modules/websocket/SocketProvider';
import axios from 'axios';

axios.interceptors.request.use(
  (req) => {
    console.log('REQUEST:', req.url)
    console.log('HEADERS:', req.headers)
    return req
  }
)

axios.interceptors.response.use(
  (res) => {
    console.log('RESPONSE:', res.config.url)
    console.log('STATUS:', res.status)
    return res
  },
  (error) => {
    console.log('API ERROR:', error.response?.data)
    throw error
  }
)

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


