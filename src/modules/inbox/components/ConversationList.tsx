'use client';

import React from 'react';
import { List } from 'react-window';
import { Avatar, Badge, Input, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Conversation } from '@/types/inbox';
import { useInboxStore } from '@/stores/inboxStore';
import { formatDistanceToNow } from 'date-fns';

const Row = ({ index, style, data }: any) => {
  const item = data[index];
  const { activeConversationId, setActiveConversationId } = useInboxStore();
  const isActive = activeConversationId === item.id;

  return (
    <div 
      style={style} 
      onClick={() => setActiveConversationId(item.id)}
      className={`px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
    >
      <Avatar src={item.customerAvatar} size={44} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-semibold truncate text-gray-900">{item.customerName}</span>
          <span className="text-[10px] text-gray-400">
            {formatDistanceToNow(new Date(item.lastMessageTime), { addSuffix: true })}
          </span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <p className="text-sm text-gray-500 truncate mb-0">{item.lastMessage}</p>
          {item.unreadCount > 0 && (
            <Badge count={item.unreadCount} size="small" offset={[0, 0]} color="#6366f1" />
          )}
        </div>
      </div>
    </div>
  );
};

export default function ConversationList({ conversations }: { conversations: Conversation[] }) {
  return (
    <div className="h-full flex flex-col border-r border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <Input 
          prefix={<SearchOutlined className="text-gray-400" />} 
          placeholder="Search conversations..." 
          className="rounded-lg bg-gray-50 border-none"
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <List
          rowCount={conversations.length}
          rowHeight={80}
          rowComponent={Row}
          rowProps={{ data: conversations }}
          style={{ height: '100%', width: '100%' }}
        />
      </div>

    </div>
  );
}
