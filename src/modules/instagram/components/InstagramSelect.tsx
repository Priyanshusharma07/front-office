'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Typography,
  Card,
  Avatar,
  App,
  Spin,
  Alert,
  Empty,
  Tag,
} from 'antd';
import {
  CheckCircleFilled,
  FacebookOutlined,
  InstagramOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/services/useApiClient';

const { Title, Text, Paragraph } = Typography;

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface AvailablePagesResponse {
  name: string;
  id: string;
  pages: FacebookPage[];
}

function SelectContent() {
  const { message } = App.useApp();
  const api = useApiClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = searchParams.get('session');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log('[InstagramSelect] Component mounted. Session:', session);
  }, [session]);

  useEffect(() => {
    console.log('========== CALLBACK ==========')
    console.log('CURRENT URL:', window.location.href)
    console.log('QUERY:', window.location.search)
    const params = new URLSearchParams(window.location.search)
    console.log('CODE:', params.get('code'))
    console.log('STATE:', params.get('state'))
    console.log('TOKEN:', params.get('token'))
    console.log('SESSION:', params.get('session'))
    console.log('================================')
  }, []);

  const getErrorMessage = (err: any) => {
    if (!err) return null;
    const responseData = err.response?.data;
    if (responseData?.error === 'session_expired' || responseData?.message?.includes('expired')) {
      return 'Your OAuth connection session has expired. Please go back and reconnect your account.';
    }
    if (responseData?.error === 'access_denied' || responseData?.message?.includes('denied') || searchParams.get('error') === 'access_denied') {
      return 'Access was denied. Please make sure to approve all permissions in the Meta (Facebook) popup.';
    }
    if (responseData?.error === 'meta_api_failure' || responseData?.message?.includes('Meta')) {
      return 'Meta API Error: Unable to fetch your business pages from Facebook. Please try again.';
    }
    return responseData?.message || err.message || 'An unexpected error occurred. Please try again.';
  };

  // 1. Fetch available pages
  const { data, isLoading, error } = useQuery<AvailablePagesResponse>({
    queryKey: ['available-pages', session],
    queryFn: async () => {
      if (!session) throw new Error('No session provided');
      const url = `/instagram/available-pages?session=${session}`;
      console.log('REQUEST URL:', `${API}${url}`);
      const result = await api.get<AvailablePagesResponse>(url);
      console.log('RESPONSE:', result);
      return result;
    },
    enabled: !!session && isMounted,
  });

  // 2. Mutation to save selected account
  const selectMutation = useMutation({
    mutationFn: async (page: FacebookPage) => {
      console.log('REQUEST URL:', `${API}/instagram/select-account`);
      const result = await api.post('/instagram/select-account', {
        pageId: page.id,
        pageAccessToken: page.access_token,
        name: page.name,
      });
      console.log('RESPONSE:', result);
      return result;
    },
    onSuccess: () => {
      message.success('Account connected successfully!');
      const redirectUrl = '/integrations?connected=true';
      console.log('REDIRECTING:', redirectUrl);
      router.push(redirectUrl);
    },
    onError: (err: any) => {
      const errorMsg = getErrorMessage(err) || 'Failed to connect account';
      message.error(errorMsg);
    },
  });

  if (!isMounted) return null;

  if (!session || searchParams.get('error') === 'access_denied') {
    const isDenied = searchParams.get('error') === 'access_denied';
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert
          type="error"
          showIcon
          title={isDenied ? "Access Denied" : "Invalid Session"}
          description={
            isDenied 
              ? "You denied the required permissions in the Facebook popup. Please try again and approve all request permissions."
              : "The Instagram connection session has expired or is invalid. Please try connecting again."
          }
          className="max-w-md w-full rounded-2xl shadow-md p-6"
          action={
            <Button type="primary" danger onClick={() => {
              console.log('REDIRECTING:', '/integrations');
              router.push('/integrations');
            }}>
              Back to Integrations
            </Button>
          }
        />
      </div>
    );
  }

  const handleSelect = (page: FacebookPage) => {
    setSelectedPageId(page.id);
    selectMutation.mutate(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
      <div className="max-w-3xl mx-auto" suppressHydrationWarning>
        <div className="text-center mb-10" suppressHydrationWarning>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <FacebookOutlined style={{ fontSize: '32px' }} />
          </div>
          <Title level={2}>Select Instagram Page</Title>
          <Paragraph type="secondary" className="text-lg">
            We found {data?.pages?.length || 0} pages associated with your account. 
            Choose the one you want to use with BrokerageX.
          </Paragraph>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Spin size="large" />
            <Text type="secondary" className="mt-4">Fetching your pages...</Text>
          </div>
        ) : error ? (
          <Alert
            type="error"
            showIcon
            title="Instagram Connection Error"
            description={getErrorMessage(error)}
            className="rounded-2xl"
          />
        ) : (!data?.pages || data.pages.length === 0) ? (
          <Card className="rounded-3xl shadow-sm border-gray-100 text-center py-10">
            <Empty
              description={
                <div className="space-y-2">
                  <Text strong className="block">No Facebook Pages found</Text>
                  <Text type="secondary" className="block text-sm">
                    Make sure your Instagram account is a **Business Account** and is linked to a **Facebook Page**.
                  </Text>
                </div>
              }
            />
            <Button className="mt-6" onClick={() => router.push('/integrations')}>
              Back to Integrations
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {data?.pages?.map((page) => (
              <Card
                key={page.id}
                hoverable
                className={`rounded-2xl border-2 transition-all duration-200 ${
                  selectedPageId === page.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100'
                }`}
                onClick={() => !selectMutation.isPending && handleSelect(page)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar
                      size={64}
                      src={page.picture?.data?.url}
                      icon={!page.picture?.data?.url && <InstagramOutlined />}
                      className="bg-gradient-to-tr from-purple-500 to-pink-500"
                    />
                    <div>
                      <Title level={4} className="!mb-0">{page.name}</Title>
                      <Text type="secondary" className="text-xs">{page.category}</Text>
                      <div className="mt-1">
                        <Tag color="blue" className="rounded-full">Instagram Business</Tag>
                      </div>
                    </div>
                  </div>
                  
                  {selectedPageId === page.id && selectMutation.isPending ? (
                    <Spin />
                  ) : selectedPageId === page.id ? (
                    <CheckCircleFilled className="text-blue-500 text-2xl" />
                  ) : (
                    <ArrowRightOutlined className="text-gray-300 text-xl" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Paragraph type="secondary" className="text-sm">
            Don't see your page? Make sure you've granted the "Manage Pages" and "Instagram Business" permissions in the Facebook popup.
          </Paragraph>
          <Button type="link" onClick={() => window.location.href = `${API}/instagram/connect`}>
            Re-authenticate with Facebook
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function InstagramSelect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" description="Loading..." />
      </div>
    }>
      <SelectContent />
    </Suspense>
  );
}
