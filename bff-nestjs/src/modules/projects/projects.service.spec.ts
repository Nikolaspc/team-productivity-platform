import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role, TeamRole } from '@prisma/client';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  const mockPrisma = {
    extended: {
      team: { findUnique: jest.fn() },
      project: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        softDelete: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should throw NotFound if team does not exist', async () => {
      mockPrisma.extended.team.findUnique.mockResolvedValue(null);
      await expect(service.create(1, { name: 'P1' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should create a project if team exists', async () => {
      mockPrisma.extended.team.findUnique.mockResolvedValue({
        id: 1,
      });
      mockPrisma.extended.project.create.mockResolvedValue({
        id: 101,
        name: 'P1',
      });
      const result = await service.create(1, { name: 'P1' } as any);
      expect(result.id).toBe(101);
    });
  });

  describe('findAllByTeam', () => {
    it('should return many projects', async () => {
      mockPrisma.extended.project.findMany.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAllByTeam(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('should throw NotFound if project not found', async () => {
      mockPrisma.extended.project.findFirst.mockResolvedValue(null);
      await expect(service.remove(1, 99, Role.ADMIN)).rejects.toThrow(NotFoundException);
    });

    it('should throw Forbidden if user is not Admin and not Owner', async () => {
      mockPrisma.extended.project.findFirst.mockResolvedValue({
        id: 99,
      });
      await expect(service.remove(1, 99, Role.USER, TeamRole.MEMBER)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow deletion if user is ADMIN', async () => {
      mockPrisma.extended.project.findFirst.mockResolvedValue({
        id: 99,
      });
      await service.remove(1, 99, Role.ADMIN);
      expect(mockPrisma.extended.project.softDelete).toHaveBeenCalledWith(99);
    });

    it('should allow deletion if user is Team OWNER', async () => {
      mockPrisma.extended.project.findFirst.mockResolvedValue({
        id: 99,
      });
      await service.remove(1, 99, Role.USER, TeamRole.OWNER);
      expect(mockPrisma.extended.project.softDelete).toHaveBeenCalledWith(99);
    });
  });
});
