import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

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
    // English: findFirst is required because findUnique doesn't support filtering by non-unique 'deletedAt'
    const attachment = await this.prisma.extended.attachment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  async remove(id: number) {
    const attachment = await this.findOne(id);

    // English: First, perform soft delete in database
    // This ensures data consistency even if storage deletion fails
    try {
      const deletedAttachment = await this.prisma.attachment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.log(`Soft deleted attachment ${id} from database`);

      // English: Then attempt to delete from cloud storage
      // If this fails, it's logged but doesn't affect the main operation
      try {
        await this.storageService.deleteFile(attachment.url);
        this.logger.log(`Successfully deleted attachment ${id} from cloud storage`);
      } catch (storageError: unknown) {
        const errorMessage = storageError instanceof Error ? storageError.message : 'Unknown error';
        this.logger.warn(
          `Failed to delete attachment ${id} from storage (soft delete completed): ${errorMessage}`,
        );
        // English: Don't throw - soft delete in DB is the priority
        // Storage deletion can be retried manually if needed
      }

      return deletedAttachment;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error deleting attachment ${id}: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to remove attachment from database');
    }
  }
}
