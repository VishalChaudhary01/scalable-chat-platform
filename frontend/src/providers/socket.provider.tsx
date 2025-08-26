import type React from 'react';
import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { SocketContext } from '../context/socket.context';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = (message: string) => {
    if (socket) {
      socket.emit('event:message', message);
    }
  };

  const onMessageRecieve = (message: string) => {
    setMessages((prev) => [...prev, message]);
  };

  useEffect(() => {
    const _socket = io('http://localhost:3000');
    setSocket(_socket);

    return () => {
      _socket.disconnect();
      setSocket(null);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('event:message', onMessageRecieve);

    return () => {
      socket.off('event:message', onMessageRecieve);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ messages, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
