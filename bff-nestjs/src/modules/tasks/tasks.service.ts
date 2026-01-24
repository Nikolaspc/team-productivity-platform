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
    private attachmentsService: AttachmentsService,
  ) {}

  async create(userId: number, dto: CreateTaskDto) {
    // English: Check if project exists and user has access via membership
    const project = await this.prisma.extended.project.findFirst({
      where: {
        id: dto.projectId,
        team: {
          members: {
            some: { userId },
          },
        },
      },
      include: {
        team: true,
      },
    });

    if (!project) {
      throw new ForbiddenException(
        'Project not found or no permission to add tasks',
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
        project.team.id,
        task.title,
        'created',
      );
    } catch (error) {
      this.logger.warn(
        `Failed to send WebSocket notification for task ${task.id}`,
      );
    }

    return task;
  }

  async addAttachment(
    taskId: number,
    fileData: {
      filename: string;
      url: string;
      mimetype: string;
      size: number;
    },
  ) {
    // English: Ensure the task exists before calling attachment service
    const task = await this.prisma.extended.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.attachmentsService.create(taskId, fileData);
  }

  async removeAttachment(attachmentId: number) {
    // English: Use delegated service to handle attachment removal
    // This includes both storage deletion and database soft-delete
    return this.attachmentsService.remove(attachmentId);
  }

  async findAllByProject(userId: number, projectId: number) {
    // English: Ensure user is part of the team that owns the project
    const project = await this.prisma.extended.project.findFirst({
      where: {
        id: projectId,
        team: {
          members: {
            some: { userId },
          },
        },
      },
    });

    if (!project) {
      throw new ForbiddenException('Project access denied');
    }

    return this.prisma.extended.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            url: true,
            mimetype: true,
            size: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * English: Recovery method for soft-deleted tasks.
   * This is useful for compliance and user-requested recovery.
   * Only accessible to admins or team owners.
   */
  async restoreTask(taskId: number) {
    return (this.prisma.extended.task as any).restore(taskId);
  }

  /**
   * English: Permanent deletion of a task.
   * This operation cannot be undone. Use with extreme caution.
   * Should only be called after user confirmation and audit logging.
   */
  async permanentlyDeleteTask(taskId: number) {
    // English: First, hard-delete all attachments
    const attachments = await this.prisma.attachment.findMany({
      where: { taskId },
    });

    // English: Delete attachments from storage
    for (const attachment of attachments) {
      try {
        await this.storageService.deleteFile(attachment.url);
      } catch (error) {
        this.logger.warn(
          `Failed to delete attachment file ${attachment.id} from storage`,
        );
      }
    }

    // English: Hard delete the task (bypasses soft-delete logic)
    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}
