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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const tasks_service_1 = require("./tasks.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const storage_service_1 = require("../../storage/storage.service");
const at_guard_1 = require("../../auth/guards/at.guard");
const decorators_1 = require("../../common/decorators");
let TasksController = class TasksController {
    tasksService;
    storageService;
    constructor(tasksService, storageService) {
        this.tasksService = tasksService;
        this.storageService = storageService;
    }
    async create(userId, dto) {
        return this.tasksService.create(userId, dto);
    }
    async findAll(projectId, userId) {
        return this.tasksService.findAllByProject(userId, projectId);
    }
    async uploadFile(taskId, file) {
        const fileUrl = await this.storageService.uploadFile(file);
        return this.tasksService.addAttachment(taskId, {
            filename: file.originalname,
            url: fileUrl,
            mimetype: file.mimetype,
            size: file.size,
        });
    }
    async removeAttachment(attachmentId) {
        return this.tasksService.removeAttachment(attachmentId);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new task' }),
    __param(0, (0, decorators_1.GetCurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tasks for a project' }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, decorators_1.GetCurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':id/upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload an attachment to a task' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|zip)$/ }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Delete)('attachments/:attachmentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove an attachment from a task' }),
    __param(0, (0, common_1.Param)('attachmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "removeAttachment", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('Tasks'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(at_guard_1.AtGuard),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService,
        storage_service_1.StorageService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map