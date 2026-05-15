'use client';

import React from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { 
  MessageOutlined, 
  ThunderboltOutlined, 
  CloseCircleOutlined, 
  InstagramOutlined,
  CheckCircleOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const { Title, Text } = Typography;

const data = [
  { name: 'Mon', replies: 400, comments: 2400 },
  { name: 'Tue', replies: 300, comments: 1398 },
  { name: 'Wed', replies: 200, comments: 9800 },
  { name: 'Thu', replies: 278, comments: 3908 },
  { name: 'Fri', replies: 189, comments: 4800 },
  { name: 'Sat', replies: 239, comments: 3800 },
  { name: 'Sun', replies: 349, comments: 4300 },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      <div>
        <Title level={3}>Overview</Title>
        <Text type="secondary">Welcome back! Here's what's happening with your account today.</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic 
              title="Total Comments" 
              value={12543} 
              prefix={<MessageOutlined className="text-indigo-500 mr-2" />} 
            />
            <div className="text-green-500 text-xs font-semibold mt-2">
              <RiseOutlined /> +12% from last week
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic 
              title="Replies Sent" 
              value={8432} 
              prefix={<ThunderboltOutlined className="text-yellow-500 mr-2" />} 
            />
             <div className="text-green-500 text-xs font-semibold mt-2">
              <RiseOutlined /> +8% from last week
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic 
              title="Failed Replies" 
              value={23} 
              styles={{ content: { color: '#cf1322' } }}
              prefix={<CloseCircleOutlined className="mr-2" />} 
            />
             <div className="text-red-500 text-xs font-semibold mt-2">
              -2% from last week
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic 
              title="Response Rate" 
              value={98.2} 
              suffix="%" 
              prefix={<CheckCircleOutlined className="text-green-500 mr-2" />} 
            />
             <div className="text-green-500 text-xs font-semibold mt-2">
              Stable
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Activity Trends" className="shadow-sm">
        <div style={{ height: 350 }}>
          {typeof window !== 'undefined' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="replies" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorReplies)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
