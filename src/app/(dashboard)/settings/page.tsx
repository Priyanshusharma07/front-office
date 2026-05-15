'use client';

import React from 'react';
import { Tabs, Card, Typography, Form, Input, Button, Switch, Divider, Space } from 'antd';
import { UserOutlined, BellOutlined, SafetyCertificateOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Title level={3}>Settings</Title>
        <Text type="secondary">Manage your account preferences and application settings.</Text>
      </div>

      <Card className="shadow-sm">
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: (
                <span>
                  <UserOutlined />
                  Profile
                </span>
              ),
              children: (
                <div className="max-w-2xl py-4 space-y-6">
                  <Form layout="vertical">
                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item label="First Name">
                        <Input defaultValue="Alex" />
                      </Form.Item>
                      <Form.Item label="Last Name">
                        <Input defaultValue="Thompson" />
                      </Form.Item>
                    </div>
                    <Form.Item label="Email Address">
                      <Input defaultValue="alex@example.com" disabled />
                    </Form.Item>
                    <Form.Item label="Timezone">
                      <Input defaultValue="(GMT-08:00) Pacific Time" />
                    </Form.Item>
                    <Button type="primary">Save Changes</Button>
                  </Form>
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span>
                  <BellOutlined />
                  Notifications
                </span>
              ),
              children: (
                <div className="py-4 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900">Email Notifications</div>
                      <div className="text-sm text-gray-500">Receive weekly reports and account alerts.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900">Push Notifications</div>
                      <div className="text-sm text-gray-500">Get real-time alerts for new comments.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              ),
            },
            {
              key: '3',
              label: (
                <span>
                  <SafetyCertificateOutlined />
                  Security
                </span>
              ),
              children: (
                <div className="py-4 space-y-6">
                  <Button danger>Change Password</Button>
                  <Divider />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">Add an extra layer of security to your account.</div>
                    </div>
                    <Button>Enable</Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
