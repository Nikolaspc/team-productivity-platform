import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notifications: NotificationsGateway,
    @InjectQueue('mail-queue') private mailQueue: Queue,
  ) {}

  async createInvitation(
    teamId: number,
    inviterId: number,
    targetEmail: string,
    role: string,
  ) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const lowerEmail = targetEmail.toLowerCase();

    const existingMember = await this.prisma.teamMember.findFirst({
      where: { teamId, user: { email: lowerEmail } },
    });
    if (existingMember)
      throw new BadRequestException('User is already a member of this team');

    const invitationToken = this.jwtService.sign(
      { teamId, email: lowerEmail, role, inviterId },
      { expiresIn: '24h' },
    );

    const invitation = await this.prisma.invitation.create({
      data: {
        email: lowerEmail,
        token: invitationToken,
        teamId,
        inviterId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'PENDING', // English: Matches your Prisma InvitationStatus
      },
    });

    await this.mailQueue.add('send-invitation', {
      email: lowerEmail,
      token: invitationToken,
      teamName: team.name,
    });

    return {
      message: 'Invitation sent successfully',
      invitationId: invitation.id,
    };
  }

  async acceptInvitation(token: string, userId: number) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const { teamId, email, role } = payload;

      const invitation = await this.prisma.invitation.findUnique({
        where: { token },
      });

      // English: Corrected 'used' check to use 'status' as per your Prisma error
      if (
        !invitation ||
        invitation.status === 'ACCEPTED' ||
        new Date() > invitation.expiresAt
      ) {
        throw new BadRequestException(
          'Invitation invalid, already accepted or expired',
        );
      }

      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      // English: Fix for 'user is possibly null' and 'name can be null'
      if (!user) throw new NotFoundException('User not found');

      if (user.email.toLowerCase() !== email.toLowerCase()) {
        throw new ForbiddenException('Email mismatch for this invitation');
      }

      const userName = user.name ?? 'New Member'; // English: Fallback if name is null

      await this.prisma.$transaction([
        this.prisma.teamMember.create({
          data: { userId, teamId, role: role || 'MEMBER' },
        }),
        this.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'ACCEPTED' }, // English: Corrected property name
        }),
      ]);

      this.notifications.notifyInvitationAccepted(teamId, userName);

      return { message: 'Joined the team successfully' };
    } catch (error: any) {
      // English: Cast to any to access .name
      if (error.name === 'JsonWebTokenError')
        throw new BadRequestException('Invalid invitation token');
      throw error;
    }
  }
}
