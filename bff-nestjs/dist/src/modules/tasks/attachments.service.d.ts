import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
export declare class AttachmentsService {
    private prisma;
    private storageService;
    private readonly logger;
    constructor(prisma: PrismaService, storageService: StorageService);
    create(taskId: number, fileData: {
        filename: string;
        url: string;
        mimetype: string;
        size: number;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        filename: string;
        url: string;
        mimetype: string;
        size: number;
        taskId: number;
    }>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        filename: string;
        url: string;
        mimetype: string;
        size: number;
        taskId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        filename: string;
        url: string;
        mimetype: string;
        size: number;
        taskId: number;
    }>;
}
