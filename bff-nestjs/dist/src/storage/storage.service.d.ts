import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private config;
    private s3Client;
    private readonly logger;
    constructor(config: ConfigService);
    uploadFile(file: Express.Multer.File): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
}
