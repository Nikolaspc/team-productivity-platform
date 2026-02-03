import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { MailService } from '../mail/mail.service';
import { TeamRole, InvitationStatus } from '@prisma/client';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notifications: NotificationsGateway,
    private mailService: MailService,
  ) {}

  async createInvitation(
    teamId: number,
    inviterId: number,
    targetEmail: string,
    role: TeamRole = TeamRole.MEMBER,
  ) {
    // 1. Check team existence and get members
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // 2. Check that inviter is OWNER of the team
    const inviterMember = team.members.find((m) => m.userId === inviterId);
    if (!inviterMember) {
      throw new ForbiddenException('You are not a member of this team');
    }
    if (inviterMember.role !== TeamRole.OWNER) {
      throw new ForbiddenException('Only team owners can send invitations');
    }

    const lowerEmail = targetEmail.toLowerCase();

    // 3. Check if user is already a member
    const existingMember = await this.prisma.teamMember.findFirst({
      where: { teamId, user: { email: lowerEmail } },
    });
    if (existingMember) {
      throw new BadRequestException('User is already a member of this team');
    }

    // 4. Check that user is not inviting themselves
    const inviterUser = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });
    if (inviterUser?.email.toLowerCase() === lowerEmail) {
      throw new BadRequestException('You cannot invite yourself');
    }

    // 5. Generate JWT token for invitation
    const invitationToken = this.jwtService.sign(
      { teamId, email: lowerEmail, role, inviterId },
      { expiresIn: '7d' },
    );

    // 6. Save invitation to database
    const invitation = await this.prisma.invitation.create({
      data: {
        email: lowerEmail,
        token: invitationToken,
        teamId,
        inviterId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: InvitationStatus.PENDING,
      },
    });

    // 7. Send invitation email
    await this.mailService.sendInvitationEmail(lowerEmail, team.name, invitationToken);

    return {
      message: 'Invitation sent successfully',
      invitationId: invitation.id,
    };
  }

  async acceptInvitation(token: string, userId: number) {
    try {
      // 1. Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const { teamId, email, role } = payload;

      // 2. Find invitation in database
      const invitation = await this.prisma.invitation.findUnique({
        where: { token },
      });

      if (
        !invitation ||
        invitation.status === InvitationStatus.ACCEPTED ||
        new Date() > invitation.expiresAt
      ) {
        throw new BadRequestException('Invitation invalid, already accepted or expired');
      }

      // 3. Get current user
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 4. Verify email matches
      if (user.email.toLowerCase() !== email.toLowerCase()) {
        throw new ForbiddenException('Email mismatch for this invitation');
      }

      const userName = user.name ?? 'New Member';

      // 5. Atomic transaction
      await this.prisma.$transaction([
        this.prisma.teamMember.create({
          data: {
            userId,
            teamId,
            role: (role as TeamRole) || TeamRole.MEMBER,
          },
        }),
        this.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.ACCEPTED },
        }),
      ]);

      // 6. Notify via WebSockets
      this.notifications.notifyInvitationAccepted(teamId, userName);

      return { message: 'Joined the team successfully' };
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid invitation token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Invitation token has expired');
      }
      throw error;
    }
  }
}
