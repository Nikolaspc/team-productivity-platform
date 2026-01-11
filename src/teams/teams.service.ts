// src/teams/teams.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new team and automatically assigns the creator as OWNER
   */
  async create(dto: CreateTeamDto, userId: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Create the team entity
        const team = await tx.team.create({
          data: { name: dto.name },
        });

        // 2. Create the membership record for the creator
        await tx.teamMember.create({
          data: {
            userId: userId,
            teamId: team.id,
            role: 'OWNER', // High-level permission for the creator
          },
        });

        return team;
      });
    } catch (error) {
      // Professional logging should happen here
      throw new InternalServerErrorException(
        'Transaction failed: Could not create team',
      );
    }
  }

  /**
   * Retrieves all teams where the current user is a member
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
   * Generates a unique invitation token for a team
   */
  async inviteMember(teamId: number, inviterId: number, dto: InviteMemberDto) {
    // Security check: Verify the inviter belongs to the team
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

    // Token generation (Enterprise standard: 32 bytes hex)
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

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
   * Validates invitation token and adds user to the team
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
      // Add user to team
      const membership = await tx.teamMember.create({
        data: {
          userId,
          teamId: invitation.teamId,
          role: 'MEMBER',
        },
      });

      // Mark token as used
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });

      return membership;
    });
  }
}
