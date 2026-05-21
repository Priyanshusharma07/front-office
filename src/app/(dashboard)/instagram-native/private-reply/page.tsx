'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Space, Divider } from 'antd';
import { useRouter } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function PrivateReplySettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSend = async (values: any) => {
    setLoading(true);
    console.log('PRIVATE_REPLY_SENT', values);
    
    // Fake API call
    setTimeout(() => {
      message.success('Private reply sent successfully');
      form.resetFields();
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6">
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => router.push('/instagram-native')}
        className="mb-4 p-0"
      >
        Back to Dashboard
      </Button>

      <Title level={2}>Private Reply Settings</Title>
      
      <Card className="mt-6 max-w-2xl">
        <div className="mb-6 bg-gray-50 p-4 rounded-md">
          <Text strong>Comment Preview</Text>
          <div className="mt-2">
            <Text type="secondary">@user123: </Text>
            <Text>"How much is this? Looks amazing!"</Text>
          </div>
        </div>
        
        <Divider />
        
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSend}
        >
          <Form.Item 
            label="Message Editor" 
            name="message"
            rules={[{ required: true, message: 'Please enter your message' }]}
          >
            <Input.TextArea rows={4} placeholder="Type your private reply here..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="mt-2">
              Send Private Reply
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
