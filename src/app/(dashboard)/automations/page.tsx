'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Switch, Space, Typography, Tag, Modal, Card, App, Select, Avatar, Spin, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined, InstagramOutlined } from '@ant-design/icons';
import AutomationForm from '@/modules/automations/components/AutomationForm';
import { AutomationRule } from '@/types/automation';

const { Title, Text } = Typography;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// We need this interface locally or from a shared types file
export interface InstagramAccountMinimal {
  id: string;
  username: string;
  profilePicture?: string;
}

export default function AutomationsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  // 1. Fetch connected accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<InstagramAccountMinimal[]>({
    queryKey: ['instagram-accounts'],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/instagram/accounts`, {
        headers: { Authorization: `Bearer mock_token` },
      });
      return data;
    },
  });

  // Select first account by default
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // 2. Fetch rules for selected account
  const { data: rules = [], isLoading: rulesLoading } = useQuery<AutomationRule[]>({
    queryKey: ['automation-rules', selectedAccountId],
    queryFn: async () => {
      if (!selectedAccountId) return [];
      const { data } = await axios.get(`${API}/automation/${selectedAccountId}`, {
        headers: { Authorization: `Bearer mock_token` },
      });
      return data;
    },
    enabled: !!selectedAccountId,
  });

  // 3. Mutations
  const upsertMutation = useMutation({
    mutationFn: async (ruleData: any) => {
      const payload = { ...ruleData, instagramAccountId: selectedAccountId };
      const { data } = await axios.post(`${API}/automation`, payload, {
        headers: { Authorization: `Bearer mock_token` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules', selectedAccountId] });
      message.success(editingRule ? 'Automation updated' : 'Automation created');
      setIsModalOpen(false);
      setEditingRule(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API}/automation/${id}`, {
        headers: { Authorization: `Bearer mock_token` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules', selectedAccountId] });
      message.success('Automation deleted');
    },
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AutomationRule) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" className="text-xs">{record.triggerType.replace('_', ' ')}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: AutomationRule) => (
        <Switch 
          checked={isActive} 
          size="small" 
          onChange={(checked) => {
            upsertMutation.mutate({ ...record, isActive: checked });
          }} 
        />
      ),
    },
    {
      title: 'Matches',
      dataIndex: 'matchCount',
      key: 'matchCount',
      render: (count: number) => <Tag color="blue">{count} hits</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AutomationRule) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => {
            setEditingRule(record);
            setIsModalOpen(true);
          }} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => {
            deleteMutation.mutate(record.id);
          }} />
        </Space>
      ),
    },
  ];
  const handleSubmit = (data: any) => {
    const keywordsArray = typeof data.keywords === 'string' 
      ? data.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : Array.isArray(data.keywords) ? data.keywords : [];

    const payload = {
      ...data,
      keywords: keywordsArray,
      id: editingRule?.id,
    };

    upsertMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Title level={3}>Automations</Title>
          <Text type="secondary">Manage your automated private replies and comment triggers.</Text>
        </div>
        
        <Space size="middle" className="w-full sm:w-auto">
          {accounts.length > 0 && (
            <Select
              value={selectedAccountId}
              onChange={setSelectedAccountId}
              placeholder="Select account"
              className="min-w-[200px]"
              options={accounts.map(acc => ({
                value: acc.id,
                label: (
                  <Space>
                    <Avatar size="small" src={acc.profilePicture} icon={<InstagramOutlined />} />
                    {acc.username}
                  </Space>
                )
              }))}
            />
          )}
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            disabled={!selectedAccountId}
            onClick={() => {
              setEditingRule(null);
              setIsModalOpen(true);
            }}
            className="shadow-md shadow-indigo-200"
          >
            New Automation
          </Button>
        </Space>
      </div>

      {accountsLoading ? (
        <div className="py-20 text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">Loading accounts...</div>
        </div>
      ) : accounts.length === 0 ? (
        <Card className="py-20 text-center rounded-3xl border-dashed border-2">
          <Empty
            image={<InstagramOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
            description={
              <div className="space-y-2">
                <Text strong className="block">No Instagram accounts connected</Text>
                <Text type="secondary">Connect an account first to start building automations.</Text>
              </div>
            }
          >
            <Button type="primary" onClick={() => window.location.href = '/integrations'}>
              Go to Integrations
            </Button>
          </Empty>
        </Card>
      ) : (
        <Card className="shadow-sm overflow-hidden rounded-2xl border-gray-100">
          <Table 
            columns={columns} 
            dataSource={rules} 
            rowKey="id"
            loading={rulesLoading || upsertMutation.isPending}
            pagination={false}
            className="border-none"
            locale={{
              emptyText: (
                <Empty 
                  description="No automation rules yet for this account." 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="dashed" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Create your first rule
                  </Button>
                </Empty>
              )
            }}
          />
        </Card>
      )}

      <Modal
        title={editingRule ? 'Edit Automation' : 'Create Automation'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <AutomationForm 
          initialValues={editingRule || {}} 
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
