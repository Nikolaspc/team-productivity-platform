import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProjectsService = {
    create: jest.fn(),
    findAllByTeam: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: PrismaService, useValue: {} }, // Mock vacío para el guard
        Reflector,
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should call create service', async () => {
    const dto = { name: 'Test Project' } as any;
    await controller.create(1, dto);
    expect(service.create).toHaveBeenCalledWith(1, dto);
  });

  it('should call findAll service', async () => {
    await controller.findAll(1);
    expect(service.findAllByTeam).toHaveBeenCalledWith(1);
  });

  it('should call remove service', async () => {
    await controller.remove(1, 100, 1, Role.USER);
    expect(service.remove).toHaveBeenCalledWith(1, 100, Role.USER);
  });
});
