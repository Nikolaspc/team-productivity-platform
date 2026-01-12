// src/teams/teams.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';
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
        // 1. English: Create the team
        const team = await tx.team.create({
          data: { name: dto.name },
        });

        // 2. English: Create the membership record for the creator
        await tx.teamMember.create({
          data: {
            userId: userId,
            teamId: team.id,
            role: 'ADMIN',
          },
        });

        return team;
      });
    } catch (error) {
      this.logger.error(`Error creating team: ${error.message}`);
      throw new InternalServerErrorException(
        `Transaction failed: ${error.message}`,
      );
    }
  }

  /**
   * English: Retrieves all teams where the current user is a member
   */
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

  /**
   * English: Generates a unique invitation token for a team
   */
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

  /**
   * English: Validates invitation token and adds user to the team
   */
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
  }
}
