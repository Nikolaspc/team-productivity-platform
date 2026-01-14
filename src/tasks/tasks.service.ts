// src/tasks/tasks.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { StorageService } from '../storage/storage.service'; // English: Import required for cleanup

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsGateway,
    private storageService: StorageService, // English: Inject StorageService
  ) {}

  async create(userId: number, dto: CreateTaskDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { team: { include: { members: true } } },
    });

    if (!project) throw new NotFoundException('Project not found');

    const isMember = project.team.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('No permission to add tasks here');
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });

    this.notifications.notifyTaskUpdate(project.teamId, task.title, 'created');
    return task;
  }

  // English: Link cloud file metadata to the task
  async addAttachment(
    taskId: number,
    fileData: { filename: string; url: string; mimetype: string; size: number },
  ) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.attachment.create({
      data: {
        ...fileData,
        taskId: taskId,
      },
    });
  }

  /**
   * English: NEW METHOD - Deletes from both Cloud and Database
   * This fixes the error TS2339 in the controller
   */
  async removeAttachment(attachmentId: number) {
    // 1. English: Check if the attachment exists
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with ID ${attachmentId} not found`,
      );
    }

    try {
      // 2. English: Delete physical file from Supabase
      await this.storageService.deleteFile(attachment.url);

      // 3. English: Delete metadata from PostgreSQL
      return await this.prisma.attachment.delete({
        where: { id: attachmentId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete attachment');
    }
  }

  async findAllByProject(userId: number, projectId: number) {
    return this.prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
      include: {
        assignee: { select: { name: true, email: true } },
        attachments: true,
      },
    });
  }
}
