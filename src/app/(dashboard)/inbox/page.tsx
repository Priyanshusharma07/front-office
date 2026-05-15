'use client';

import React, { useEffect } from 'react';
import { Row, Col, Empty } from 'antd';
import dynamic from 'next/dynamic';
import MessageThread from '@/modules/inbox/components/MessageThread';
import MessageInput from '@/modules/inbox/components/MessageInput';

const ConversationList = dynamic(() => import('@/modules/inbox/components/ConversationList'), { ssr: false });

import { useInboxStore } from '@/stores/inboxStore';

const mockConversations = [
  {
    id: '1',
    customerName: 'Sarah Jenkins',
    customerAvatar: 'https://i.pravatar.cc/150?u=sarah',
    lastMessage: 'Thanks for the quick reply!',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2,
    status: 'open' as const,
  },
  {
    id: '2',
    customerName: 'Marcus Aurelius',
    customerAvatar: 'https://i.pravatar.cc/150?u=marcus',
    lastMessage: 'Is this automation or a real person?',
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
    status: 'pending' as const,
  }
];

const mockMessages = {
  '1': [
    { id: '1', text: 'Hello, I saw your comment on my post!', sender: 'customer', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: '2', text: 'Hi Sarah! How can I help you today?', sender: 'user', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', text: 'Thanks for the quick reply!', sender: 'customer', timestamp: new Date().toISOString() },
  ]
};

export default function InboxPage() {
  const { 
    activeConversationId, 
    setConversations, 
    conversations,
    messages,
    addMessage 
  } = useInboxStore();

  useEffect(() => {
    // Initial load
    setConversations(mockConversations);
  }, [setConversations]);

  const activeMessages = activeConversationId ? (messages[activeConversationId] || mockMessages[activeConversationId as keyof typeof mockMessages] || []) : [];

  const handleSend = (text: string) => {
    if (activeConversationId) {
      addMessage(activeConversationId, {
        id: Math.random().toString(36).substr(2, 9),
        text,
        sender: 'user',
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] -m-6 flex overflow-hidden">
      <div className="w-80 h-full">
        <ConversationList conversations={conversations} />
      </div>
      <div className="flex-1 h-full flex flex-col">
        {activeConversationId ? (
          <>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
               <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 text-lg">
                    {conversations.find(c => c.id === activeConversationId)?.customerName}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-400">Online</span>
               </div>
            </div>
            <MessageThread messages={activeMessages} />
            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <Empty description="Select a conversation to start messaging" />
          </div>
        )}
      </div>
    </div>
  );
}
