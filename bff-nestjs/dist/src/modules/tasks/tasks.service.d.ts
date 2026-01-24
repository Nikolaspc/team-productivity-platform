import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { StorageService } from '../../storage/storage.service';
import { AttachmentsService } from './attachments.service';
export declare class TasksService {
    private prisma;
    private notifications;
    private storageService;
    private attachmentsService;
    private readonly logger;
    constructor(prisma: PrismaService, notifications: NotificationsGateway, storageService: StorageService, attachmentsService: AttachmentsService);
    create(userId: number, dto: CreateTaskDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        dueDate: Date | null;
        assigneeId: number | null;
        projectId: number;
    }>;
    addAttachment(taskId: number, fileData: {
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
    removeAttachment(attachmentId: number): Promise<{
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
    findAllByProject(userId: number, projectId: number): Promise<({
        assignee: {
            id: number;
            email: string;
            name: string | null;
        } | null;
        attachments: {
            id: number;
            createdAt: Date;
            filename: string;
            url: string;
            mimetype: string;
            size: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        dueDate: Date | null;
        assigneeId: number | null;
        projectId: number;
    })[]>;
    restoreTask(taskId: number): Promise<any>;
    permanentlyDeleteTask(taskId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        dueDate: Date | null;
        assigneeId: number | null;
        projectId: number;
    }>;
}
