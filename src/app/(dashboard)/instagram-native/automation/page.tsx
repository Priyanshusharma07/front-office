'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, Select, message, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function InstagramNativeAutomation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    setLoading(true);
    console.log('AUTOMATION_CREATED', values);
    
    // Fake API call
    setTimeout(() => {
      message.success('Automation configured successfully');
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

      <Title level={2}>Configure Automation</Title>
      
      <Card className="mt-6 max-w-2xl">
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSave}
          initialValues={{ enable: true, triggerType: 'comment' }}
        >
          <Form.Item label="Enable Automation" name="enable" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item label="Trigger Type" name="triggerType">
            <Select>
              <Select.Option value="comment">New Comment</Select.Option>
              <Select.Option value="message">Direct Message</Select.Option>
              <Select.Option value="story_reply">Story Reply</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="Keywords (comma separated)" 
            name="keywords"
            rules={[{ required: true, message: 'Please enter keywords to trigger automation' }]}
          >
            <Input placeholder="e.g. price, info, help" />
          </Form.Item>

          <Form.Item 
            label="Reply Message" 
            name="replyMessage"
            rules={[{ required: true, message: 'Please enter a reply message' }]}
          >
            <Input.TextArea rows={4} placeholder="Type your automated response here..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="mt-2">
              Save Automation
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
