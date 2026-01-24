import { TaskStatus } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    projectId: number;
    assigneeId?: number;
    dueDate?: string;
}
