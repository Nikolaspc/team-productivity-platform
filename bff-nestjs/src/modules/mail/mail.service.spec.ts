import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should log and return true when sending invitation', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const result = await service.sendInvitationEmail(
      'test@test.com',
      'Team A',
      'token123',
    );

    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
