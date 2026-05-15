'use client';

import React from 'react';
import { Row, Col, Card, DatePicker, Select, Button, Space, Typography, Table } from 'antd';
import { DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const dailyData = [
  { name: 'Mon', comments: 120, replies: 110, failed: 2 },
  { name: 'Tue', comments: 150, replies: 145, failed: 1 },
  { name: 'Wed', comments: 200, replies: 198, failed: 0 },
  { name: 'Thu', comments: 180, replies: 170, failed: 5 },
  { name: 'Fri', comments: 250, replies: 240, failed: 2 },
  { name: 'Sat', comments: 300, replies: 290, failed: 4 },
  { name: 'Sun', comments: 280, replies: 275, failed: 1 },
];

const successData = [
  { name: 'Successful', value: 98 },
  { name: 'Failed', value: 2 },
];

const COLORS = ['#6366f1', '#f87171'];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={3}>Analytics</Title>
          <Text type="secondary">Deep dive into your automation performance and engagement metrics.</Text>
        </div>
        <Space>
          <RangePicker className="rounded-lg" />
          <Button icon={<DownloadOutlined />}>Export CSV</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Activity Comparison" className="shadow-sm">
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                  <Bar dataKey="comments" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="Total Comments" />
                  <Bar dataKey="replies" fill="#6366f1" radius={[4, 4, 0, 0]} name="Automated Replies" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Success Rate" className="shadow-sm">
            <div style={{ height: 350 }} className="flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {successData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-[-180px] z-10">
                <div className="text-3xl font-bold text-gray-900">98%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Success Rate</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Automation Performance" className="shadow-sm">
         <Table 
            pagination={false}
            columns={[
              { title: 'Rule Name', dataIndex: 'name', key: 'name' },
              { title: 'Matches', dataIndex: 'matches', key: 'matches' },
              { title: 'Conversion', dataIndex: 'conv', key: 'conv', render: (val) => <Text strong className="text-green-600">{val}%</Text> },
              { title: 'Avg. Delay', dataIndex: 'delay', key: 'delay' },
            ]}
            dataSource={[
              { key: '1', name: 'Welcome Message', matches: 1250, conv: 94, delay: 'Instant' },
              { key: '2', name: 'Pricing Inquiry', matches: 450, conv: 88, delay: '2 mins' },
              { key: '3', name: 'Discount Code', matches: 890, conv: 91, delay: '5 mins' },
            ]}
         />
      </Card>
    </div>
  );
}
