// src/modules/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { StorageModule } from '../../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AttachmentsService } from './attachments.service'; // <--- Importación añadida

@Module({
  imports: [StorageModule, NotificationsModule],
  controllers: [TasksController],
  providers: [
    TasksService,
    AttachmentsService, // <--- Proveedor añadido
  ],
  exports: [TasksService],
})
export class TasksModule {}
