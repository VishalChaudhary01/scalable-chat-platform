import { Server } from 'socket.io';
import Redis from 'ioredis';
import { Server as HttpServer } from 'http';
import { setupWorker } from '@socket.io/sticky';
import { createShardedAdapter } from '@socket.io/redis-adapter';
import { prisma } from '../configs/prisma.config';

export class SocketServer {
  private static instance: SocketServer;
  private io!: Server;

  private pubClient = new Redis();
  private subClient = this.pubClient.duplicate();

  private constructor() {}

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer();
    }
    return SocketServer.instance;
  }

  public init(server: HttpServer): void {
    this.io = new Server(server, {
      cors: { origin: '*' },
      adapter: createShardedAdapter(this.pubClient, this.subClient),
    });

    setupWorker(this.io);

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`A new client connected to ${process.pid}`);

      socket.on('event:message', async (message: string) => {
        try {
          this.io.emit('event:message', message);
          await prisma.message.create({
            data: { text: message },
          });
        } catch (error) {
          console.error('Failed to emit message', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });
    });
  }

  public getIO(): Server {
    if (!this.io) throw new Error('Socket.io not initialized!');
    return this.io;
  }
}
