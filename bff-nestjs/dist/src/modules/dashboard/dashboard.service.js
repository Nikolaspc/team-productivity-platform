"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTeamStats(teamId) {
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
        if (!team)
            throw new common_1.NotFoundException(`Team with ID ${teamId} not found`);
        const now = new Date();
        const projectStats = team.projects.map((project) => {
            const totalTasks = project._count.tasks;
            const completedTasks = project.tasks.filter((t) => t.status === client_1.TaskStatus.DONE).length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const overdueTasks = project.tasks.filter((t) => t.status !== client_1.TaskStatus.DONE &&
                t.dueDate &&
                new Date(t.dueDate) < now).length;
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map