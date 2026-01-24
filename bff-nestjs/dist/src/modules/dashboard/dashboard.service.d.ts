import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getTeamStats(teamId: number): Promise<{
        teamName: string;
        totalProjects: number;
        projects: {
            id: number;
            name: string;
            progress: number;
            totalTasks: number;
            completedTasks: number;
            overdueTasks: number;
        }[];
    }>;
}
