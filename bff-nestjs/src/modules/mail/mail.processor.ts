import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
// English: Corrected path. Since both files are in src/modules/mail/, use './'
import { MailService } from './mail.service';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);

    switch (job.name) {
      case 'send-invitation':
        const { email, token, teamName } = job.data;
        return await this.mailService.sendInvitationEmail(email, teamName, token);

      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
