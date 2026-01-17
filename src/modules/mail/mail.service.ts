// En src/modules/mail/mail.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  // constructor(@InjectQueue('mail') private mailQueue: Queue) {} // English: Comment this out

  async sendInvitationEmail(email: string, teamName: string, token: string) {
    // English: Instead of adding to BullMQ queue, we just log it for now
    console.log(
      `[SIMULATED MAIL] Sending invitation to ${email} for team ${teamName}`,
    );
    console.log(`[SIMULATED MAIL] Token: ${token}`);
    return true;
  }
}
