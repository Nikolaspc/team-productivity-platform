import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Req,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

// English: Ensure these files exist in the same folder: src/modules/tasks/
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

// English: Correct paths to global services and guards
import { StorageService } from '../../storage/storage.service';
import { AtGuard } from '../../auth/guards/at.guard';
import type { Request } from 'express';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(AtGuard) // English: Added guard to protect all task routes
@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(
    private readonly tasksService: TasksService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task in a project' })
  async create(@Body() dto: CreateTaskDto, @Req() req: Request) {
    const user = req.user as any;
    const userId = user?.userId || user?.sub;
    this.logger.log(`User ${userId} creating task in project ${dto.projectId}`);
    return this.tasksService.create(userId, dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all tasks for a specific project' })
  async findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const userId = user?.userId || user?.sub;
    return this.tasksService.findAllByProject(userId, projectId);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload an attachment to the Cloud (Supabase)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id', ParseIntPipe) taskId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|zip)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileUrl = await this.storageService.uploadFile(file);
    const attachment = await this.tasksService.addAttachment(taskId, {
      filename: file.originalname,
      url: fileUrl,
      mimetype: file.mimetype,
      size: file.size,
    });

    return {
      message: 'File uploaded to cloud successfully',
      attachment,
    };
  }

  @Delete('attachment/:id')
  @ApiOperation({ summary: 'Delete a file from Cloud and Database' })
  async deleteAttachment(@Param('id', ParseIntPipe) id: number) {
    await this.tasksService.removeAttachment(id);
    return { message: 'File and metadata deleted successfully' };
  }
}
