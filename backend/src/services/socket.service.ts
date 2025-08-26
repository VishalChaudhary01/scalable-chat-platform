import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketServer {
  private static instance: SocketServer;
  private io!: Server;

  private constructor() {}

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer();
    }
    return SocketServer.instance;
  }

  public init(server: HttpServer): void {
    this.io = new Server(server, { cors: { origin: '*' } });

    this.io.on('connection', (socket) => {
      console.log(`A new client connected`);

      socket.on('event:message', (message: string) => {
        console.log('message recieved from client: ', message);
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
