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
var AttachmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const storage_service_1 = require("../../storage/storage.service");
let AttachmentsService = AttachmentsService_1 = class AttachmentsService {
    prisma;
    storageService;
    logger = new common_1.Logger(AttachmentsService_1.name);
    constructor(prisma, storageService) {
        this.prisma = prisma;
        this.storageService = storageService;
    }
    async create(taskId, fileData) {
        this.logger.log(`Attaching file ${fileData.filename} to task ${taskId}`);
        return this.prisma.extended.attachment.create({
            data: {
                ...fileData,
                taskId,
            },
        });
    }
    async findOne(id) {
        const attachment = await this.prisma.extended.attachment.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
        if (!attachment) {
            throw new common_1.NotFoundException(`Attachment with ID ${id} not found`);
        }
        return attachment;
    }
    async remove(id) {
        const attachment = await this.findOne(id);
        try {
            const deletedAttachment = await this.prisma.attachment.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            this.logger.log(`Soft deleted attachment ${id} from database`);
            try {
                await this.storageService.deleteFile(attachment.url);
                this.logger.log(`Successfully deleted attachment ${id} from cloud storage`);
            }
            catch (storageError) {
                const errorMessage = storageError instanceof Error
                    ? storageError.message
                    : 'Unknown error';
                this.logger.warn(`Failed to delete attachment ${id} from storage (soft delete completed): ${errorMessage}`);
            }
            return deletedAttachment;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error deleting attachment ${id}: ${errorMessage}`);
            throw new common_1.InternalServerErrorException('Failed to remove attachment from database');
        }
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = AttachmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map