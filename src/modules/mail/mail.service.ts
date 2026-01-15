import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendInvitationEmail(to: string, teamName: string, token: string) {
    // English: In production, use Nodemailer, SendGrid, or Resend here.
    const invitationUrl = `https://tuapp.com/accept-invitation?token=${token}`;

    this.logger.log(
      `📧 Sending invitation email to ${to} for team ${teamName}`,
    );
    this.logger.debug(`Invitation Link: ${invitationUrl}`);

    // English: Simulate email sending delay
    return { success: true, messageId: 'fake-id-123' };
  }
}
