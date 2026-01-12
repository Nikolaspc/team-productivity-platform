// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { TasksController } from './tasks.controller.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [StorageModule], // English: Import StorageModule to use its service
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
