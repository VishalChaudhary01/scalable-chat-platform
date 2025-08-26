import { Server } from 'socket.io';
import Redis from 'ioredis';
import { Server as HttpServer } from 'http';
import { setupWorker } from '@socket.io/sticky';
import { createShardedAdapter } from '@socket.io/redis-adapter';

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

      socket.on('event:message', (message: string) => {
        this.io.emit('event:message', message);
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
