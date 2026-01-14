// src/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }, // English: Open for dev, restrict in production
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server; // English: Fixed TS2564 with !

  handleConnection(client: Socket) {
    console.log(`[WebSocket] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Client disconnected: ${client.id}`);
  }

  // English: Method to notify all members of a team about a change
  notifyTaskUpdate(teamId: number, taskTitle: string, action: string) {
    if (this.server) {
      this.server.emit(`team_${teamId}`, {
        message: `Task "${taskTitle}" was ${action}`,
        timestamp: new Date(),
      });
    }
  }
}
