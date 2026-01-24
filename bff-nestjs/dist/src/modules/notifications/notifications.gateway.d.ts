import { Server, Socket } from 'socket.io';
export declare class NotificationsGateway {
    server: Server;
    private readonly logger;
    handleJoinTeam(teamId: number, client: Socket): void;
    notifyInvitationAccepted(teamId: number, userName: string): void;
    notifyTaskUpdate(teamId: number, taskTitle: string, action: string): void;
}
