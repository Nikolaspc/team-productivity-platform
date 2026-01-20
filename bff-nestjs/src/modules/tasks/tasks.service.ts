import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { StorageService } from '../../storage/storage.service';
import { AttachmentsService } from './attachments.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsGateway,
    private storageService: StorageService,
    private attachmentsService: AttachmentsService, // English: Injected to handle attachment logic
  ) {}

  async create(userId: number, dto: CreateTaskDto) {
    // English: Check if project exists and user has access via membership
    const project = await this.prisma.extended.project.findUnique({
      where: { id: dto.projectId },
      include: { team: { include: { members: { where: { userId } } } } },
    });

    if (!project) throw new NotFoundException('Project not found');

    if (project.team.members.length === 0) {
      throw new ForbiddenException(
        'No permission to add tasks to this project',
      );
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

    // English: Notify via WebSocket. Wrap in try-catch to prevent main flow failure
    try {
      this.notifications.notifyTaskUpdate(
        project.teamId,
        task.title,
        'created',
      );
    } catch (e) {
      this.logger.warn(
        `Failed to send WebSocket notification for task ${task.id}`,
      );
    }

    return task;
  }

  async addAttachment(
    taskId: number,
    fileData: { filename: string; url: string; mimetype: string; size: number },
  ) {
    // English: Ensure the task exists before calling attachment service
    const task = await this.prisma.extended.task.findUnique({
      where: { id: taskId },
    });
    if (!task) throw new NotFoundException('Task not found');

    return this.attachmentsService.create(taskId, fileData);
  }

  async removeAttachment(attachmentId: number) {
    // English: Use delegated service to find the attachment
    const attachment = await this.attachmentsService.findOne(attachmentId);

    try {
      // 1. Delete from Cloud Storage (S3)
      await this.storageService.deleteFile(attachment.url);

      // 2. Delete from Database via AttachmentsService
      return await this.attachmentsService.remove(attachmentId);
    } catch (error) {
      // English: Fix for TS18046: 'error' is of type 'unknown'
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error removing attachment ${attachmentId}: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Failed to delete attachment from cloud',
      );
    }
  }

  async findAllByProject(userId: number, projectId: number) {
    // English: Ensure user is part of the team that owns the project
    const project = await this.prisma.extended.project.findFirst({
      where: {
        id: projectId,
        team: { members: { some: { userId } } },
      },
    });

    if (!project) throw new ForbiddenException('Project access denied');

    return this.prisma.extended.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { name: true, email: true } },
        attachments: true,
      },
    });
  }
}
