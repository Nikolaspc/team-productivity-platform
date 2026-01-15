// src/modules/tasks/attachments.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(private prisma: PrismaService) {}

  async addAttachmentToTask(
    taskId: number,
    fileData: { filename: string; url: string; mimetype: string; size: number },
  ) {
    this.logger.log(`Attaching file ${fileData.filename} to task ${taskId}`);

    return this.prisma.extended.attachment.create({
      data: {
        ...fileData,
        taskId,
      },
    });
  }
}
