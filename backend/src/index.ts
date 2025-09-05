import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cluster from 'cluster';
import { cpus } from 'os';
import { setupMaster } from '@socket.io/sticky';
import { config } from './config/env.config';
import { socketService } from './services/socket.service';
import { kafkaService } from './services/kafka-service';
import { errorHandler } from './middlewares/error-handler';
import { HttpStatus } from './config/http.config';

export const totalCUPs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  const httpServer = createServer();

  kafkaService.initAdmin();

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

  socketService.init(server);
  kafkaService.startConsumer();

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'Healthy server!' });
  });

  app.use((req: Request, res: Response, _next: NextFunction) => {
    res.status(HttpStatus.NOT_FOUND).json({
      message: `API not found route at PATH: ${req.path}`,
    });
  });

  app.use(errorHandler);

  console.log(`Worker ${process.pid} setup complete`);
}
