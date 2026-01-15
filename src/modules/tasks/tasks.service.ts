import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway'; // English: Corrected path and name
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsGateway, // English: Unified naming
    private storageService: StorageService,
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
        status: dto.status,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });

    // English: Using the method defined in our NotificationsGateway
    this.notifications.notifyTaskUpdate(project.teamId, task.title, 'created');

    return task;
  }

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

  async removeAttachment(attachmentId: number) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) throw new NotFoundException('Attachment not found');

    try {
      // English: Deletes file from Supabase/Cloud
      await this.storageService.deleteFile(attachment.url);

      // English: Deletes record from Database
      return await this.prisma.attachment.delete({
        where: { id: attachmentId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete attachment');
    }
  }

  async findAllByProject(userId: number, projectId: number) {
    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { name: true, email: true } },
        attachments: true,
      },
    });
  }
}
