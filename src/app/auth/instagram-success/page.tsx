'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Typography, Spin, Steps } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      console.log('TOKEN_RECEIVED: Successfully received authentication token');
      
      // Step 1: Connecting Instagram...
      setCurrentStep(0);
      
      setTimeout(() => {
        // Step 2: Loading profile...
        console.log('PROFILE_RECEIVED: Fetching user profile information');
        setCurrentStep(1);
        
        setTimeout(() => {
          // Step 3: Creating session...
          console.log('Creating session and storing token');
          localStorage.setItem('instagram_auth_token', token);
          sessionStorage.setItem('instagram_auth_session', 'active');
          setCurrentStep(2);
          
          setTimeout(() => {
            // Step 4: Redirecting...
            console.log('LOGIN_SUCCESS: Redirecting to dashboard');
            setCurrentStep(3);
            
            setTimeout(() => {
              router.push('/dashboard');
            }, 500);
          }, 1000);
        }, 1000);
      }, 1000);
    } else {
      console.error('No token found in URL parameters');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircleFilled className="text-4xl text-indigo-500" />
          </div>
          <Title level={3} className="!mb-2">Authentication Successful</Title>
          <Text type="secondary">Setting up your CRM workspace...</Text>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <Steps
            direction="vertical"
            current={currentStep}
            items={[
              { title: 'Connecting Instagram...', icon: currentStep === 0 ? <Spin size="small" /> : undefined },
              { title: 'Loading profile...', icon: currentStep === 1 ? <Spin size="small" /> : undefined },
              { title: 'Creating session...', icon: currentStep === 2 ? <Spin size="small" /> : undefined },
              { title: 'Redirecting...', icon: currentStep === 3 ? <Spin size="small" /> : undefined },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default function InstagramSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
