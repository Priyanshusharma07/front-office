'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Typography } from 'antd';
import { LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  const handleLogin = () => {
    // Just redirect to the intended page since auth is mocked
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full shadow-lg rounded-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LoginOutlined className="text-2xl" />
          </div>
          <Title level={2} className="m-0 text-indigo-600">BrokerageX</Title>
          <Text type="secondary">Sign in to your dashboard</Text>
        </div>

        <Button 
          type="primary" 
          size="large" 
          block 
          onClick={handleLogin}
          className="h-12 text-base font-semibold rounded-xl"
        >
          Sign In as Test User
        </Button>
        
        <div className="mt-6 text-center text-xs text-gray-400">
          Auth is currently in test mode
        </div>
      </Card>
    </div>
  );
}
