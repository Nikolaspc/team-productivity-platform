// bff-nestjs/src/teams/teams.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamRole } from '@prisma/client';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateTeamDto) {
    return this.prisma.extended.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: { name: dto.name },
      });

      await tx.teamMember.create({
        data: {
          userId: userId,
          teamId: team.id,
          role: TeamRole.OWNER,
        },
      });

      this.logger.log(
        `Team created: ${team.name} (ID: ${team.id}) by User: ${userId}`,
      );
      return team;
    });
  }

  async findAll(userId: number) {
    return this.prisma.extended.team.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        _count: { select: { members: true, projects: true } },
      },
    });
  }

  /**
   * Enterprise SaaS Logic: Soft delete team and all associated resources.
   * Only called after TeamOwnerGuard validation.
   */
  async remove(teamId: number) {
    return this.prisma.extended.$transaction(async (tx) => {
      const now = new Date();

      // 1. English: Cascade soft-delete for tasks
      await (tx as any).task.updateMany({
        where: { project: { teamId } },
        data: { deletedAt: now },
      });

      // 2. English: Cascade soft-delete for projects
      await (tx as any).project.updateMany({
        where: { teamId },
        data: { deletedAt: now },
      });

      // 3. English: Soft-delete the team
      const team = await (tx as any).team.update({
        where: { id: teamId },
        data: { deletedAt: now },
      });

      this.logger.warn(
        `SaaS Tenant Deactivated: Team ${teamId} and cascading resources marked as deleted.`,
      );
      return team;
    });
  }
}
