import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { StorageModule } from '../../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module'; // English: Changed from events to notifications

@Module({
  imports: [
    StorageModule,
    NotificationsModule, // English: Corrected module name
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
