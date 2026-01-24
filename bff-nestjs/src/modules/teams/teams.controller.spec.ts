// bff-nestjs/src/modules/teams/teams.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { PrismaService } from '@/prisma/prisma.service'; // English: Fixed with Alias
import { Reflector } from '@nestjs/core';
import { AtGuard } from '@/auth/guards/at.guard'; // English: Fixed with Alias
import { RolesGuard } from '@/common/guards/roles.guard'; // English: Fixed with Alias
import { TeamOwnerGuard } from '@/common/guards/team-owner.guard'; // English: Fixed with Alias
import { CreateTeamDto } from './dto/create-team.dto';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: TeamsService;

  // English: Mocking the service methods used in the controller
  const mockTeamsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        { provide: TeamsService, useValue: mockTeamsService },
        { provide: PrismaService, useValue: {} }, // English: Mocked Prisma dependency
        Reflector,
      ],
    })
      // English: Bypassing guards for unit testing the controller logic
      .overrideGuard(AtGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TeamOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call create team service', async () => {
      const userId = 1;
      const dto: CreateTeamDto = { name: 'New Team' };
      mockTeamsService.create.mockResolvedValue({ id: 1, ...dto });

      await controller.create(userId, dto);
      expect(service.create).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('findAll', () => {
    it('should call findAll team service', async () => {
      const userId = 1;
      mockTeamsService.findAll.mockResolvedValue([]);

      await controller.findAll(userId);
      expect(service.findAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('remove', () => {
    it('should call remove service with correct ID', async () => {
      const id = 10;
      mockTeamsService.remove.mockResolvedValue({ id, deletedAt: new Date() });

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result.id).toBe(id);
    });
  });
});
