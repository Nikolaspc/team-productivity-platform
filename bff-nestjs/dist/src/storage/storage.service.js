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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("@nestjs/config");
let StorageService = StorageService_1 = class StorageService {
    config;
    s3Client;
    logger = new common_1.Logger(StorageService_1.name);
    constructor(config) {
        this.config = config;
        this.s3Client = new client_s3_1.S3Client({
            region: this.config.get('STORAGE_REGION'),
            endpoint: this.config.get('STORAGE_ENDPOINT'),
            credentials: {
                accessKeyId: this.config.get('STORAGE_ACCESS_KEY'),
                secretAccessKey: this.config.get('STORAGE_SECRET_KEY'),
            },
            forcePathStyle: true,
        });
    }
    async uploadFile(file) {
        const bucket = this.config.get('STORAGE_BUCKET');
        const fileKey = `task-attachments/${Date.now()}-${file.originalname}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        });
        await this.s3Client.send(command);
        const endpoint = this.config.get('STORAGE_ENDPOINT');
        return `${endpoint}/${bucket}/${fileKey}`;
    }
    async deleteFile(fileUrl) {
        const bucket = this.config.get('STORAGE_BUCKET');
        try {
            const bucketMarker = `/${bucket}/`;
            const markerIndex = fileUrl.indexOf(bucketMarker);
            if (markerIndex === -1) {
                throw new Error(`Bucket marker "${bucketMarker}" not found in URL: ${fileUrl}`);
            }
            const fileKey = fileUrl.substring(markerIndex + bucketMarker.length);
            this.logger.log(`Attempting to delete cloud file with key: ${fileKey}`);
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: bucket,
                Key: fileKey,
            });
            await this.s3Client.send(command);
            this.logger.log(`Successfully deleted file: ${fileKey}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Cloud Delete Error: ${errorMessage}`);
            throw error;
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map