import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getTeamStats(teamId: number) {
    const team = await this.prisma.extended.team.findUnique({
      where: { id: teamId },
      include: {
        projects: {
          include: {
            _count: {
              select: { tasks: true },
            },
            tasks: {
              select: { status: true, dueDate: true },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const now = new Date();
    const projectStats = team.projects.map((project) => {
      const totalTasks = project._count.tasks;
      const completedTasks = project.tasks.filter((t) => t.status === TaskStatus.DONE).length;

      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const overdueTasks = project.tasks.filter(
        (t) => t.status !== TaskStatus.DONE && t.dueDate && new Date(t.dueDate) < now,
      ).length;

      return {
        id: project.id,
        name: project.name,
        progress,
        totalTasks,
        completedTasks,
        overdueTasks,
      };
    });

    return {
      teamName: team.name,
      totalProjects: team.projects.length,
      projects: projectStats,
    };
  }
}
