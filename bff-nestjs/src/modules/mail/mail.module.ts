import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { InMemoryQueueService } from '@/common/infrastructure/queues/in-memory-queue.service';

@Module({
  providers: [
    {
      provide: 'MAIL_QUEUE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const driver = config.get('QUEUE_DRIVER');

        return new InMemoryQueueService();
      },
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
