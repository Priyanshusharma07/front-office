'use client';

import React, { useRef, useEffect } from 'react';
import { Avatar, Typography } from 'antd';
import { Message } from '@/types/inbox';
import { format } from 'date-fns';

const { Text } = Typography;

export default function MessageThread({ messages }: { messages: Message[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfcfd]">
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';
        return (
          <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
              {!isUser && <Avatar src="https://i.pravatar.cc/150?u=customer" />}
              <div className="flex flex-col">
                <div 
                  className={`px-4 py-2 rounded-2xl shadow-sm text-sm ${
                    isUser 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-100 rounded-tl-none text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
                <Text type="secondary" className={`text-[10px] mt-1 ${isUser ? 'text-right' : ''}`}>
                  {format(new Date(msg.timestamp), 'HH:mm')}
                </Text>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
