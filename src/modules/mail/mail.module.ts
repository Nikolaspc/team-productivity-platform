import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
// import { MailProcessor } from './mail.processor'; // English: Commented to avoid Redis dependency

@Module({
  providers: [
    MailService,
    // MailProcessor // English: Commented to avoid "Worker requires a connection" error
  ],
  exports: [MailService],
})
export class MailModule {}
