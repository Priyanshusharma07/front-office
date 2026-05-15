'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, Typography } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full shadow-lg rounded-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserAddOutlined className="text-2xl" />
          </div>
          <Title level={2} className="m-0 text-indigo-600">BrokerageX</Title>
          <Text type="secondary">Create your account</Text>
        </div>

        <Button 
          type="primary" 
          size="large" 
          block 
          onClick={handleSignup}
          className="h-12 text-base font-semibold rounded-xl"
        >
          Get Started
        </Button>
        
        <div className="mt-6 text-center text-xs text-gray-400">
          Auth is currently in test mode
        </div>
      </Card>
    </div>
  );
}
