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
var ProjectsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProjectsService = ProjectsService_1 = class ProjectsService {
    prisma;
    logger = new common_1.Logger(ProjectsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(teamId, dto) {
        const team = await this.prisma.extended.team.findUnique({
            where: { id: teamId },
        });
        if (!team)
            throw new common_1.NotFoundException(`Team with ID ${teamId} not found`);
        return this.prisma.extended.project.create({
            data: {
                ...dto,
                teamId: teamId,
            },
        });
    }
    async findAllByTeam(teamId) {
        return this.prisma.extended.project.findMany({
            where: { teamId },
            include: {
                _count: { select: { tasks: true } },
            },
        });
    }
    async remove(teamId, projectId, userRole, teamRole) {
        const project = await this.prisma.extended.project.findFirst({
            where: { id: projectId, teamId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found in this team');
        const canDelete = userRole === client_1.Role.ADMIN || teamRole === client_1.TeamRole.OWNER;
        if (!canDelete) {
            throw new common_1.ForbiddenException('Only Team Owners or Admins can delete projects');
        }
        return this.prisma.extended.project.softDelete(projectId);
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = ProjectsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map