// src/tasks/tasks.controller.ts
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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger'; // English: Fixes ApiTags, ApiBearerAuth, ApiOperation errors

import { TasksService } from './tasks.service.js'; // English: Fixes TasksService error
import { StorageService } from '../storage/storage.service.js'; // English: Fixes StorageService error
import { CreateTaskDto } from './dto/create-task.dto.js';
import type { Request } from 'express';

@ApiTags('tasks')
@ApiBearerAuth()
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
    const userId = user?.userId;
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
    const userId = user?.userId;
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
    // English: This calls the service which cleans up both locations
    await this.tasksService.removeAttachment(id);
    return { message: 'File and metadata deleted successfully' };
  }
}
