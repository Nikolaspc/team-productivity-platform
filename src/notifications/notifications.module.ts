import { Module, Global } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway.js';

@Global() // English: Make it global so TasksService can use it easily
@Module({
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
