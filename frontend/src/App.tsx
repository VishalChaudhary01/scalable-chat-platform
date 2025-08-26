import React, { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  function handleSubmit(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    if (socket) {
      socket.emit('event:message', message);
      setMessage('');
    }
  }

  useEffect(() => {
    const socket = io('http://localhost:3000');
    setSocket(socket);

    socket.on('event:message', (msg: string) => {
      setMessages((prev) => [...prev, msg]);
      console.log('Message recieved from server: ', msg);
    });

    return () => {
      socket.off('event:message');
      socket.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <div className="flex items-start justify-center min-h-screen w-full max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-6 pt-6">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Welcome to Chatroom
        </h1>
        <form onSubmit={handleSubmit} className="flex gap-0 ">
          <input
            type="text"
            placeholder="Send message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full md:min-w-[440px] focus:outline-none px-3 md:px-4 py-2 border border-r-0 border-blue-100 rounded-l-md"
          />
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 rounded-r-md text-base font-medium text-white px-3 md:px-4 py-2"
          >
            Send
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {messages.length > 0 &&
            messages.map((message, idx) => <div key={idx}>{message}</div>)}
        </div>
      </div>
    </div>
  );
}

export default App;
