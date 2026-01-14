// src/dashboard/dashboard.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client'; // English: Import the generated Enum from Prisma

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getTeamStats(userId: number, teamId: number) {
    // English: Verify team membership using the composite unique key
    const membership = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this team stats');
    }

    // English: Fetch projects with aggregated data
    // Optimizing by fetching only necessary fields and active tasks
    const projects = await this.prisma.project.findMany({
      where: {
        teamId,
        deletedAt: null,
      },
      include: {
        tasks: {
          where: { deletedAt: null },
          select: { status: true, dueDate: true }, // English: Only fetch fields needed for KPI calculation
        },
        _count: {
          select: { tasks: { where: { deletedAt: null } } },
        },
      },
    });

    const now = new Date();

    return projects.map((project) => {
      const tasks = project.tasks;

      // English: Calculation logic using optimized array methods
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
        // English: Added progress percentage for frontend convenience
        progress:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };
    });
  }
}
