import express from 'express';
import { createServer } from 'http';
import cluster from 'cluster';
import { cpus } from 'os';
import { setupMaster } from '@socket.io/sticky';
import { setupPrimary } from '@socket.io/cluster-adapter';
import { config } from './configs/env.config';
import { SocketServer } from './services/socket.service';

const totalCUPs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  setupPrimary();

  const httpServer = createServer();

  setupMaster(httpServer, {
    loadBalancingMethod: 'least-connection',
  });

  for (let i = 0; i < totalCUPs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died with code ${code} and signal: ${signal}`
    );
    console.log('Starting a new worker....');
    cluster.fork();
  });

  const PORT = parseInt(config.PORT);
  httpServer.listen(PORT, () =>
    console.log(`Primary server listing on port ${PORT}`)
  );
} else {
  console.log(`Worker ${process.pid} started`);

  const app = express();
  const server = createServer(app);

  const socketServer = SocketServer.getInstance();
  socketServer.init(server);

  app.get('/health', (_req, res) => {
    res.status(200).json({ message: 'Healthy server!' });
  });

  console.log(`Worker ${process.pid} setup complete`);
}
