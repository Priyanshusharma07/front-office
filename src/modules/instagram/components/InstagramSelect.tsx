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
import axios from 'axios';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log('[InstagramSelect] Component mounted. Token:', token);
  }, [token]);

  // 1. Fetch available pages
  const { data, isLoading, error } = useQuery<AvailablePagesResponse>({
    queryKey: ['available-pages', token],
    queryFn: async () => {
      if (!token) throw new Error('No token provided');
      const { data } = await axios.get(`${API}/instagram/available-pages?token=${token}`, {
        headers: { Authorization: `Bearer mock_token` },
      });
      return data;
    },
    enabled: !!token && isMounted,
  });

  // 2. Mutation to save selected account
  const selectMutation = useMutation({
    mutationFn: async (page: FacebookPage) => {
      const { data } = await axios.post(
        `${API}/instagram/select-account`,
        {
          pageId: page.id,
          pageAccessToken: page.access_token,
          name: page.name,
        },
        {
          headers: { Authorization: `Bearer mock_token` },
        }
      );
      return data;
    },
    onSuccess: () => {
      message.success('Account connected successfully!');
      // Redirect to /integrations with connected=true so the page shows a success banner
      // and immediately refetches the accounts list.
      router.push('/integrations?connected=true');
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to connect account';
      message.error(errorMsg);
    },
  });

  if (!isMounted) return null;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert
          type="error"
          title="Invalid Session"
          description="The Instagram connection session has expired or is invalid. Please try connecting again."
          action={
            <Button type="primary" onClick={() => router.push('/integrations')}>
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
            title="Error fetching pages"
            description={(error as any).message || "We couldn't retrieve your Facebook pages. Please ensure you've granted all necessary permissions."}
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
