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
exports.TeamOwnerGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TeamOwnerGuard = class TeamOwnerGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user?.role === client_1.Role.ADMIN)
            return true;
        const userId = user?.sub;
        const teamIdRaw = request.params.id || request.params.teamId;
        const teamId = parseInt(teamIdRaw, 10);
        if (!userId || isNaN(teamId)) {
            throw new common_1.ForbiddenException('User session or Team ID not found');
        }
        const membership = await this.prisma.extended.teamMember.findUnique({
            where: {
                userId_teamId: { userId, teamId },
            },
        });
        if (!membership) {
            throw new common_1.NotFoundException('Team membership not found');
        }
        if (membership.role !== client_1.TeamRole.OWNER) {
            throw new common_1.ForbiddenException('Only the team OWNER can perform this action');
        }
        return true;
    }
};
exports.TeamOwnerGuard = TeamOwnerGuard;
exports.TeamOwnerGuard = TeamOwnerGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamOwnerGuard);
//# sourceMappingURL=team-owner.guard.js.map