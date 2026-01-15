import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Path corrected
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamRole } from '@prisma/client';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTeamDto, userId: number) {
    try {
      this.logger.log(`Creating team "${dto.name}" for user ID ${userId}`);

      return await this.prisma.$transaction(async (tx) => {
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

        return team;
      });
    } catch (error: any) {
      this.logger.error(`Failed to create team: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Could not create team. Transaction failed.',
      );
    }
  }

  async findAllMyTeams(userId: number) {
    return this.prisma.team.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        _count: { select: { members: true, projects: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(teamId: number, userId: number) {
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
        members: { some: { userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!team) throw new NotFoundException('Team not found or access denied');
    return team;
  }
}
