import express from 'express';
import { config } from './configs/env.config';
import { createServer } from 'http';
import { SocketServer } from './services/socket.service';

const app = express();
const server = createServer(app);

const socketServer = SocketServer.getInstance();
socketServer.init(server);

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'Healthy server!' });
});

const PORT = parseInt(config.PORT);

server.listen(PORT, () =>
  console.log(`Server started on http://localhost:${PORT}`)
);
