import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(private prisma: PrismaService) {}

  async create(
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

  async findOne(id: number) {
    const attachment = await this.prisma.extended.attachment.findUnique({
      where: { id },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');
    return attachment;
  }

  async remove(id: number) {
    return this.prisma.extended.attachment.delete({
      where: { id },
    });
  }
}
