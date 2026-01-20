import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { AtGuard } from '../../auth/guards/at.guard';
import { TeamRole } from '@prisma/client';

describe('InvitationsController', () => {
  let controller: InvitationsController;
  let service: InvitationsService;

  const mockInvitationsService = {
    createInvitation: jest.fn(),
    acceptInvitation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationsController],
      providers: [
        { provide: InvitationsService, useValue: mockInvitationsService },
      ],
    })
      .overrideGuard(AtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InvitationsController>(InvitationsController);
    service = module.get<InvitationsService>(InvitationsService);
  });

  it('should call createInvitation service', async () => {
    const dto = { email: 'test@test.com', role: TeamRole.MEMBER };
    await controller.invite(1, 10, dto);
    expect(service.createInvitation).toHaveBeenCalledWith(
      1,
      10,
      dto.email,
      dto.role,
    );
  });

  it('should call acceptInvitation service', async () => {
    const dto = { token: 'valid-token' };
    await controller.accept(dto, 10);
    expect(service.acceptInvitation).toHaveBeenCalledWith(dto.token, 10);
  });
});
