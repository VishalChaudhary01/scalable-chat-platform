import express from 'express';
import { config } from './configs/env.config';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log(`A new client connected`);
  socket.on('event:message', (message: string) => {
    console.log('message recieved from client: ', message);
    io.emit('event:message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'Healthy server!' });
});

const PORT = parseInt(config.PORT);

server.listen(PORT, () =>
  console.log(`Server started on http://localhost:${PORT}`)
);
