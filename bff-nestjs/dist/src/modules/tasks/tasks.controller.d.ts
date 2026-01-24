import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { StorageService } from '../../storage/storage.service';
export declare class TasksController {
    private readonly tasksService;
    private readonly storageService;
    constructor(tasksService: TasksService, storageService: StorageService);
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
    findAll(projectId: number, userId: number): Promise<({
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
    uploadFile(taskId: number, file: Express.Multer.File): Promise<{
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
}
