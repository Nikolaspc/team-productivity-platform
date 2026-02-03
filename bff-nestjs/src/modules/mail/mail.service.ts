import { Injectable, Inject, Logger } from '@nestjs/common';
import { IQueueService } from '@/common/infrastructure/queues/queue.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@Inject('MAIL_QUEUE') private readonly mailQueue: IQueueService) {}

  /**
   * English: Sends a welcome email to a new user.
   * Logic: Dispatches a job to the queue (Memory or Redis).
   */
  async sendWelcomeEmail(email: string, name: string) {
    this.logger.log(`Scheduling welcome email for: ${email}`);
    await this.mailQueue.addJob('send-welcome', { email, name });
  }

  /**
   * English: Sends a team invitation email.
   * This is the method causing the TS2339 error.
   */
  async sendInvitationEmail(email: string, teamName: string, inviteUrl: string) {
    this.logger.log(`Scheduling invitation email for: ${email} to join ${teamName}`);

    // English: We dispatch the job. The Processor will pick this up.
    await this.mailQueue.addJob('send-invitation', {
      email,
      teamName,
      inviteUrl,
    });
  }
}
