'use client';

import React from 'react';
import { Table, Button, Avatar, Tag, Space, Typography, Card, Modal, Input, Select, Badge } from 'antd';
import { UserAddOutlined, MoreOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function TeamPage() {

  const columns = [
    {
      title: 'Member',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar src={record.avatar} />
          <div>
            <div className="font-semibold">{text}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colors: Record<string, string> = {
          Owner: 'purple',
          Admin: 'blue',
          Agent: 'cyan',
        };
        return <Tag color={colors[role]}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Badge status={status === 'Active' ? 'success' : 'default'} text={status} />,
    },
    {
      title: '',
      key: 'actions',
      render: () => <Button type="text" icon={<MoreOutlined />} />,
    },
  ];

  const data = [
    { key: '1', name: 'Alex Thompson', email: 'alex@example.com', role: 'Owner', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=alex' },
    { key: '2', name: 'Sarah Miller', email: 'sarah@example.com', role: 'Admin', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { key: '3', name: 'David Chen', email: 'david@example.com', role: 'Agent', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=david' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={3}>Team Management</Title>
          <Text type="secondary">Invite and manage your team members and their access levels.</Text>
        </div>
        <Button type="primary" icon={<UserAddOutlined />} size="large">
          Invite Member
        </Button>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>
    </div>
  );
}
