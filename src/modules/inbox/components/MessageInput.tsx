'use client';

import React, { useState } from 'react';
import { Input, Button, Space } from 'antd';
import { SendOutlined, SmileOutlined, PaperClipOutlined } from '@ant-design/icons';

export default function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100 focus-within:border-indigo-300 transition-colors">
        <Space className="px-2">
          <Button type="text" icon={<SmileOutlined className="text-gray-400" />} />
          <Button type="text" icon={<PaperClipOutlined className="text-gray-400" />} />
        </Space>
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 4 }}
          placeholder="Type a message..."
          bordered={false}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="resize-none"
        />
        <Button 
          type="primary" 
          shape="circle" 
          icon={<SendOutlined />} 
          onClick={handleSend}
          disabled={!text.trim()}
          className="shadow-md shadow-indigo-200"
        />
      </div>
    </div>
  );
}
