import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { StorageService } from '../../storage/storage.service';
import { AtGuard } from '../../auth/guards/at.guard';
import { GetCurrentUserId } from '../../common/decorators';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(AtGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(@GetCurrentUserId() userId: number, @Body() dto: CreateTaskDto) {
    // English: The service validates if the userId has access to the project's team
    return this.tasksService.create(userId, dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all tasks for a project' })
  async findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @GetCurrentUserId() userId: number,
  ) {
    return this.tasksService.findAllByProject(userId, projectId);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload an attachment to a task' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id', ParseIntPipe) taskId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB limit
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|zip)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // English: First upload to cloud storage, then save record in DB
    const fileUrl = await this.storageService.uploadFile(file);
    return this.tasksService.addAttachment(taskId, {
      filename: file.originalname,
      url: fileUrl,
      mimetype: file.mimetype,
      size: file.size,
    });
  }

  @Delete('attachments/:attachmentId')
  @ApiOperation({ summary: 'Remove an attachment from a task' })
  async removeAttachment(
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
  ) {
    // English: Deletes from both storage provider and database
    return this.tasksService.removeAttachment(attachmentId);
  }
}
