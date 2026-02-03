import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { IMailProvider, IMailOptions } from '../interfaces/mail-provider.interface';

@Injectable()
export class NodemailerProvider implements IMailProvider {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NodemailerProvider.name);

  constructor(private config: ConfigService) {
    // English: Initialize the SMTP transporter using environment configuration
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  /**
   * English: Sends an email using the configured SMTP transport.
   * Implementation includes strict error handling for production environments.
   */
  async sendMail(options: IMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM'),
        to: options.to,
        subject: options.subject,
        // English: Basic HTML structure for the email.
        // In the future, this can be integrated with a template engine like EJS or Handlebars.
        html: `<h1>${options.subject}</h1><p>${options.context.message || ''}</p>`,
      });

      this.logger.log(`Email successfully sent to ${options.to}`);
    } catch (error: unknown) {
      // English: Type Guard to safely handle 'unknown' error type (TS18046)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Failed to send email to ${options.to}: ${errorMessage}`, errorStack);

      // English: Rethrow the error after logging to allow the caller or BullMQ to handle retries
      throw error;
    }
  }
}
