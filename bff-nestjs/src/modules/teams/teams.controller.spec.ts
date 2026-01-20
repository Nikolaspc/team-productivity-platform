import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Reflector } from '@nestjs/core';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: TeamsService;

  const mockTeamsService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        { provide: TeamsService, useValue: mockTeamsService },
        { provide: PrismaService, useValue: {} },
        Reflector,
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);
  });

  it('should call create team service', async () => {
    const dto = { name: 'New Team' } as any;
    await controller.create(1, dto);
    expect(service.create).toHaveBeenCalledWith(1, dto);
  });

  it('should call findAll team service', async () => {
    await controller.findAll(1);
    expect(service.findAll).toHaveBeenCalledWith(1);
  });
});
