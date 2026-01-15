import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  // English: Secure connection with JWT
  @UseGuards(WsJwtGuard)
  handleConnection(client: Socket) {
    this.logger.log(`[WebSocket] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[WebSocket] Client disconnected: ${client.id}`);
  }

  // English: Logic for Team Invitations
  notifyInvitationAccepted(teamId: number, userName: string) {
    if (this.server) {
      this.server.emit(`team_${teamId}`, {
        message: `${userName} has joined the team!`,
        timestamp: new Date(),
      });
    }
  }

  // English: Logic for Task Updates
  notifyTaskUpdate(teamId: number, taskTitle: string, action: string) {
    if (this.server) {
      this.server.emit(`team_${teamId}`, {
        message: `Task "${taskTitle}" was ${action}`,
        timestamp: new Date(),
      });
    }
  }
}
