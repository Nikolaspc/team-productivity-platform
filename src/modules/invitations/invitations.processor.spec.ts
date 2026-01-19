import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsProcessor } from './invitations.processor';
import { MailService } from '../mail/mail.service';
import { Logger } from '@nestjs/common';

describe('InvitationsProcessor', () => {
  let processor: InvitationsProcessor;
  let mailService: MailService;

  const mockMailService = {
    sendInvitationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsProcessor,
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    processor = module.get<InvitationsProcessor>(InvitationsProcessor);
    mailService = module.get<MailService>(MailService);
  });

  it('should process send-invitation job', async () => {
    const job = {
      id: '1',
      name: 'send-invitation',
      data: { email: 'test@test.com', token: '123', teamName: 'Team A' },
    } as any;

    await processor.process(job);

    expect(mailService.sendInvitationEmail).toHaveBeenCalledWith(
      'test@test.com',
      'Team A',
      '123',
    );
  });

  it('should log warning for unknown job name', async () => {
    const loggerSpy = jest.spyOn(Logger.prototype, 'warn');
    const job = { id: '2', name: 'unknown-task', data: {} } as any;

    await processor.process(job);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown job name'),
    );
  });
});
