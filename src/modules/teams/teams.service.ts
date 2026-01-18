import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamRole } from '@prisma/client'; // English: Essential for type safety with Enums

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateTeamDto) {
    return this.prisma.extended.$transaction(async (tx) => {
      // Create team
      const team = await tx.team.create({
        data: { name: dto.name },
      });

      // Create membership with OWNER role
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
}
