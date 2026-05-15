'use client';

import React from 'react';
import { Row, Col, Card, Button, Typography, Space, Divider, Progress, List, Tag } from 'antd';
import { CheckCircleFilled, CreditCardOutlined, HistoryOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <Title level={3}>Billing & Subscription</Title>
        <Text type="secondary">Manage your plan, payment methods, and view your billing history.</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <div className="space-y-6">
            <Card title="Current Plan" className="shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <Tag color="indigo" className="mb-2">PRO PLAN</Tag>
                  <Title level={2} className="m-0">$49<span className="text-lg text-gray-400 font-normal">/month</span></Title>
                  <Text type="secondary">Next billing date: June 15, 2024</Text>
                </div>
                <Button type="primary" ghost>Change Plan</Button>
              </div>
              
              <Divider />
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Text strong>Monthly Comments</Text>
                    <Text type="secondary">8,432 / 10,000</Text>
                  </div>
                  <Progress percent={84} showInfo={false} strokeColor="#6366f1" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <Text strong>Connected Accounts</Text>
                    <Text type="secondary">2 / 5</Text>
                  </div>
                  <Progress percent={40} showInfo={false} strokeColor="#6366f1" />
                </div>
              </div>
            </Card>

            <Card title="Payment Method" className="shadow-sm" extra={<Button type="link">Edit</Button>}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                  <CreditCardOutlined className="text-lg text-gray-500" />
                </div>
                <div>
                  <Text strong>Visa ending in 4242</Text>
                  <br />
                  <Text type="secondary" className="text-xs">Expiry: 12/26</Text>
                </div>
              </div>
            </Card>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={<Space><HistoryOutlined /> Billing History</Space>} 
            className="shadow-sm h-full"
          >
            <List
              itemLayout="horizontal"
              dataSource={[
                { date: 'May 15, 2024', amount: '$49.00', status: 'Paid' },
                { date: 'Apr 15, 2024', amount: '$49.00', status: 'Paid' },
                { date: 'Mar 15, 2024', amount: '$49.00', status: 'Paid' },
              ]}
              renderItem={(item) => (
                <List.Item className="px-0">
                  <div className="flex justify-between w-full">
                    <div>
                      <div className="font-semibold">{item.date}</div>
                      <div className="text-xs text-gray-400">Invoice #INV-2024-00{Math.floor(Math.random() * 100)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.amount}</div>
                      <Tag color="success" className="mr-0 mt-1">{item.status}</Tag>
                    </div>
                  </div>
                </List.Item>
              )}
            />
            <Button type="link" block className="mt-4">View All Invoices</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
