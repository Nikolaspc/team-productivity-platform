import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';

@Module({
  providers: [MailService, MailProcessor],
  exports: [MailService], // Exportamos el servicio para que InvitationsService pueda añadir jobs a la cola
})
export class MailModule {}
