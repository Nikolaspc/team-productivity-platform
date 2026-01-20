import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { MailService } from '../mail/mail.service'; // English: Use MailService instead of Queue
import { TeamRole, InvitationStatus } from '@prisma/client';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notifications: NotificationsGateway,
    private mailService: MailService, // English: Replaced mailQueue with mailService
  ) {}

  async createInvitation(
    teamId: number,
    inviterId: number,
    targetEmail: string,
    role: TeamRole = TeamRole.MEMBER, // English: Use TeamRole enum
  ) {
    // 1. Verificar existencia del equipo
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const lowerEmail = targetEmail.toLowerCase();

    // 2. Verificar si ya es miembro
    const existingMember = await this.prisma.teamMember.findFirst({
      where: { teamId, user: { email: lowerEmail } },
    });
    if (existingMember)
      throw new BadRequestException('User is already a member of this team');

    // 3. Generar JWT para la invitación
    const invitationToken = this.jwtService.sign(
      { teamId, email: lowerEmail, role, inviterId },
      { expiresIn: '7d' }, // English: Increased to 7 days
    );

    // 4. Guardar en DB
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

    // 5. Enviar Correo (Simulado/Logueado en consola)
    // English: Since Redis is down, we call the service directly
    await this.mailService.sendInvitationEmail(
      lowerEmail,
      team.name,
      invitationToken,
    );

    return {
      message: 'Invitation sent successfully',
      invitationId: invitation.id,
    };
  }

  async acceptInvitation(token: string, userId: number) {
    try {
      // 1. Validar Token JWT
      const payload = await this.jwtService.verifyAsync(token);
      const { teamId, email, role } = payload;

      // 2. Buscar invitación en DB
      const invitation = await this.prisma.invitation.findUnique({
        where: { token },
      });

      if (
        !invitation ||
        invitation.status === InvitationStatus.ACCEPTED ||
        new Date() > invitation.expiresAt
      ) {
        throw new BadRequestException(
          'Invitation invalid, already accepted or expired',
        );
      }

      // 3. Verificar Usuario actual
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      if (user.email.toLowerCase() !== email.toLowerCase()) {
        throw new ForbiddenException('Email mismatch for this invitation');
      }

      const userName = user.name ?? 'New Member';

      // 4. Transacción Atómica
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

      // 5. Notificar via WebSockets (Gateway)
      this.notifications.notifyInvitationAccepted(teamId, userName);

      return { message: 'Joined the team successfully' };
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError')
        throw new BadRequestException('Invalid invitation token');
      if (error.name === 'TokenExpiredError')
        throw new BadRequestException('Invitation token has expired');
      throw error;
    }
  }
}
