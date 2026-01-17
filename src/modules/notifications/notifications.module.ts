import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // Requerido para WsJwtGuard
import { NotificationsGateway } from './notifications.gateway';

@Global()
@Module({
  imports: [
    // English: We import JwtModule to allow JwtService to be injected into WsJwtGuard
    JwtModule.register({}),
  ],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
