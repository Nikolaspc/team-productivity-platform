import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { MailService } from '../mail/mail.service';
import { TeamRole } from '@prisma/client';
export declare class InvitationsService {
    private prisma;
    private jwtService;
    private notifications;
    private mailService;
    constructor(prisma: PrismaService, jwtService: JwtService, notifications: NotificationsGateway, mailService: MailService);
    createInvitation(teamId: number, inviterId: number, targetEmail: string, role?: TeamRole): Promise<{
        message: string;
        invitationId: number;
    }>;
    acceptInvitation(token: string, userId: number): Promise<{
        message: string;
    }>;
}
