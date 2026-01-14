import { Module, Global } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Global() // English: Makes NotificationsGateway available everywhere without re-importing
@Module({
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
