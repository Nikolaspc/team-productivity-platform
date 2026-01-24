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
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const storage_service_1 = require("../../storage/storage.service");
const attachments_service_1 = require("./attachments.service");
let TasksService = TasksService_1 = class TasksService {
    prisma;
    notifications;
    storageService;
    attachmentsService;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(prisma, notifications, storageService, attachmentsService) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.storageService = storageService;
        this.attachmentsService = attachmentsService;
    }
    async create(userId, dto) {
        const project = await this.prisma.extended.project.findFirst({
            where: {
                id: dto.projectId,
                team: {
                    members: {
                        some: { userId },
                    },
                },
            },
            include: {
                team: true,
            },
        });
        if (!project) {
            throw new common_1.ForbiddenException('Project not found or no permission to add tasks');
        }
        const task = await this.prisma.extended.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                status: dto.status,
                projectId: dto.projectId,
                assigneeId: dto.assigneeId,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            },
        });
        try {
            this.notifications.notifyTaskUpdate(project.team.id, task.title, 'created');
        }
        catch (error) {
            this.logger.warn(`Failed to send WebSocket notification for task ${task.id}`);
        }
        return task;
    }
    async addAttachment(taskId, fileData) {
        const task = await this.prisma.extended.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return this.attachmentsService.create(taskId, fileData);
    }
    async removeAttachment(attachmentId) {
        return this.attachmentsService.remove(attachmentId);
    }
    async findAllByProject(userId, projectId) {
        const project = await this.prisma.extended.project.findFirst({
            where: {
                id: projectId,
                team: {
                    members: {
                        some: { userId },
                    },
                },
            },
        });
        if (!project) {
            throw new common_1.ForbiddenException('Project access denied');
        }
        return this.prisma.extended.task.findMany({
            where: { projectId },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                attachments: {
                    select: {
                        id: true,
                        filename: true,
                        url: true,
                        mimetype: true,
                        size: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async restoreTask(taskId) {
        return this.prisma.extended.task.restore(taskId);
    }
    async permanentlyDeleteTask(taskId) {
        const attachments = await this.prisma.attachment.findMany({
            where: { taskId },
        });
        for (const attachment of attachments) {
            try {
                await this.storageService.deleteFile(attachment.url);
            }
            catch (error) {
                this.logger.warn(`Failed to delete attachment file ${attachment.id} from storage`);
            }
        }
        return this.prisma.task.delete({
            where: { id: taskId },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_gateway_1.NotificationsGateway,
        storage_service_1.StorageService,
        attachments_service_1.AttachmentsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map