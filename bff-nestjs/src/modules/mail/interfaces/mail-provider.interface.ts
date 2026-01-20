// src/modules/mail/interfaces/mail-provider.interface.ts
export interface IMailOptions {
  to: string;
  subject: string;
  template: string;
  context: any;
}

export interface IMailProvider {
  sendMail(options: IMailOptions): Promise<void>;
}
