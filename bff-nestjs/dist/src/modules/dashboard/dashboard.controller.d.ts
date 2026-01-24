import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(teamId: number): Promise<{
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
