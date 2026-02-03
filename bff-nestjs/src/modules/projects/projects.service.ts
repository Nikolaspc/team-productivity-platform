import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Role, TeamRole } from '@prisma/client';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private prisma: PrismaService) {}

  async create(teamId: number, dto: CreateProjectDto) {
    // English: The RolesGuard already verified membership.
    // We only check if the team exists to be safe.
    const team = await this.prisma.extended.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    return this.prisma.extended.project.create({
      data: {
        ...dto,
        teamId: teamId,
      },
    });
  }

  async findAllByTeam(teamId: number) {
    // English: Guard already checked access. Just return projects.
    return this.prisma.extended.project.findMany({
      where: { teamId },
      include: {
        _count: { select: { tasks: true } },
      },
    });
  }

  async remove(teamId: number, projectId: number, userRole: Role, teamRole?: TeamRole) {
    const project = await this.prisma.extended.project.findFirst({
      where: { id: projectId, teamId },
    });

    if (!project) {
      throw new NotFoundException('Project not found in this team');
    }

    // English: Hierarchy check: Only Global Admin or Team Owner can delete
    const canDelete = userRole === Role.ADMIN || teamRole === TeamRole.OWNER;

    if (!canDelete) {
      throw new ForbiddenException('Only Team Owners or Admins can delete projects');
    }

    return (this.prisma.extended.project as any).softDelete(projectId);
  }
}
