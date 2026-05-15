'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
// import { useAuth } from '@clerk/nextjs';
import { message } from 'antd';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  // const { getToken } = useAuth();
  const getToken = async () => 'mock_token';


  useEffect(() => {
    const initSocket = async () => {
      const token = await getToken();
      
      if (!token) return;

      const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      socket.on('NEW_COMMENT', (data) => {
        message.info(`New comment from ${data.username}`);
      });

      socket.on('RULE_MATCHED', (data) => {
        message.success(`Automation triggered for ${data.username}`);
      });

      socketRef.current = socket;
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
