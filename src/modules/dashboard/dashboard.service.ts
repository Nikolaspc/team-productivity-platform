import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Path corrected
import { TaskStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getTeamStats(userId: number, teamId: number) {
    // English: Verify team membership
    const membership = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this team stats');
    }

    const projects = await this.prisma.project.findMany({
      where: { teamId, deletedAt: null },
      include: {
        tasks: {
          where: { deletedAt: null },
          select: { status: true, dueDate: true },
        },
        _count: {
          select: { tasks: { where: { deletedAt: null } } },
        },
      },
    });

    const now = new Date();

    return projects.map((project) => {
      const tasks = project.tasks;
      const completedTasks = tasks.filter(
        (t) => t.status === TaskStatus.DONE,
      ).length;
      const totalTasks = project._count.tasks;

      return {
        projectId: project.id,
        projectName: project.name,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        overdueTasks: tasks.filter(
          (t) => t.status !== TaskStatus.DONE && t.dueDate && t.dueDate < now,
        ).length,
        progress:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };
    });
  }
}
