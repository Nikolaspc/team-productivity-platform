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

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsGateway,
    private storageService: StorageService,
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
    const task = await this.prisma.extended.task.findUnique({
      where: { id: taskId },
    });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.extended.attachment.create({
      data: { ...fileData, taskId },
    });
  }

  async removeAttachment(attachmentId: number) {
    const attachment = await this.prisma.extended.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) throw new NotFoundException('Attachment not found');

    try {
      await this.storageService.deleteFile(attachment.url);
      return await this.prisma.extended.attachment.delete({
        where: { id: attachmentId },
      });
    } catch (error) {
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
