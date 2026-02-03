import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'notifications',
})
export class NotificationsGateway {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  // English: Client joins a specific room for their team
  @SubscribeMessage('joinTeam')
  handleJoinTeam(@MessageBody('teamId') teamId: number, @ConnectedSocket() client: Socket) {
    const room = `team_${teamId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
  }

  notifyInvitationAccepted(teamId: number, userName: string) {
    this.server.to(`team_${teamId}`).emit('notification', {
      type: 'INVITATION_ACCEPTED',
      message: `${userName} has joined the team!`,
    });
  }

  notifyTaskUpdate(teamId: number, taskTitle: string, action: string) {
    this.server.to(`team_${teamId}`).emit('notification', {
      type: 'TASK_UPDATE',
      message: `Task "${taskTitle}" was ${action}`,
    });
  }
}
