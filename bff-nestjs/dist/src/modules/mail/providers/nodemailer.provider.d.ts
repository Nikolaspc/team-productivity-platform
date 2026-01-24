import { ConfigService } from '@nestjs/config';
import { IMailProvider, IMailOptions } from '../interfaces/mail-provider.interface';
export declare class NodemailerProvider implements IMailProvider {
    private config;
    private transporter;
    private readonly logger;
    constructor(config: ConfigService);
    sendMail(options: IMailOptions): Promise<void>;
}
