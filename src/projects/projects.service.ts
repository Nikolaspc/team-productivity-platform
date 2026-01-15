import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Role, TeamRole } from '@prisma/client';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    userRole: Role,
    teamId: number,
    dto: CreateProjectDto,
  ) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException(`Team with ID ${teamId} not found`);

    const membership = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    const isGlobalAdmin = userRole === Role.ADMIN;
    const isTeamOwner = membership?.role === TeamRole.OWNER;

    if (!isGlobalAdmin && !isTeamOwner) {
      throw new ForbiddenException(
        'Only the Team Owner or a Global Admin can create projects',
      );
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        teamId: teamId,
      },
    });
  }

  async findAllByTeam(userId: number, userRole: Role, teamId: number) {
    if (userRole !== Role.ADMIN) {
      const membership = await this.prisma.teamMember.findUnique({
        where: { userId_teamId: { userId, teamId } },
      });
      if (!membership)
        throw new ForbiddenException('Access denied to this team');
    }

    return this.prisma.project.findMany({
      where: { teamId, deletedAt: null },
      include: { _count: { select: { tasks: true } } },
    });
  }

  /**
   * English: Performs a soft delete on the project.
   * Tasks remain in DB but won't be visible in project-based queries.
   */
  async remove(
    userId: number,
    userRole: Role,
    teamId: number,
    projectId: number,
  ) {
    // English: 1. Validate if project exists and belongs to the team
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, teamId, deletedAt: null },
    });

    if (!project) throw new NotFoundException('Project not found in this team');

    // English: 2. Check permissions (Admin or Owner)
    const membership = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (userRole !== Role.ADMIN && membership?.role !== TeamRole.OWNER) {
      throw new ForbiddenException('Only Owners or Admins can delete projects');
    }

    // English: 3. Soft delete (Cascade effect: tasks filter by project.deletedAt)
    return this.prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });
  }
}
