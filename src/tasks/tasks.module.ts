// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    StorageModule, // English: Essential for file uploads in tasks
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
