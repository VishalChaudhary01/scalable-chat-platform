import { createContext, useContext } from 'react';

interface ISocketContext {
  messages: string[];
  sendMessage: (msg: string) => void;
}

export const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be use within Socket Provider');
  }
  return socket;
};
