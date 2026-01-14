import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { randomBytes } from 'node:crypto';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * English: Creates a new team and automatically assigns the creator as ADMIN
   */
  async create(dto: CreateTeamDto, userId: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const team = await tx.team.create({
          data: { name: dto.name },
        });

        await tx.teamMember.create({
          data: {
            userId: userId,
            teamId: team.id,
            role: 'ADMIN',
          },
        });

        return team;
      });
    } catch (error: any) {
      // English: Explicitly cast error to any to access .message in strict mode
      this.logger.error(`Error creating team: ${error.message}`);
      throw new InternalServerErrorException(
        `Transaction failed: ${error.message}`,
      );
    }
  }

  async findAllMyTeams(userId: number) {
    return this.prisma.team.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        _count: {
          select: { members: true, projects: true },
        },
      },
    });
  }

  async inviteMember(teamId: number, inviterId: number, dto: InviteMemberDto) {
    const membership = await this.prisma.teamMember.findUnique({
      where: {
        userId_teamId: { userId: inviterId, teamId },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Unauthorized: You are not a member of this team',
      );
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return await this.prisma.invitation.create({
      data: {
        email: dto.email.toLowerCase(),
        token,
        teamId,
        inviterId,
        expiresAt,
        status: 'PENDING',
      },
    });
  }

  async acceptInvitation(token: string, userId: number) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.status !== 'PENDING') {
      throw new NotFoundException('Invitation not found or already processed');
    }

    if (new Date() > invitation.expiresAt) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new ForbiddenException('Invitation token has expired');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const membership = await tx.teamMember.create({
          data: {
            userId,
            teamId: invitation.teamId,
            role: 'MEMBER',
          },
        });

        await tx.invitation.update({
          where: { id: invitation.id },
          data: { status: 'ACCEPTED' },
        });

        return membership;
      });
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
