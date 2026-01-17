import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getTeamStats(teamId: number) {
    // English: Verify if team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // English: Fetch projects with their tasks
    const projects = await this.prisma.project.findMany({
      where: { teamId },
      include: {
        tasks: true,
      },
    });

    const projectStats = projects.map((project) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(
        (t) => t.status === TaskStatus.DONE,
      ).length;

      // English: Calculate progress safely to avoid Division by Zero
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // English: Count overdue tasks (Tasks not DONE and date is past)
      const now = new Date();
      const overdueTasks = project.tasks.filter(
        (t) => t.status !== TaskStatus.DONE && t.dueDate && t.dueDate < now,
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
      totalProjects: projects.length,
      projects: projectStats,
    };
  }
}
