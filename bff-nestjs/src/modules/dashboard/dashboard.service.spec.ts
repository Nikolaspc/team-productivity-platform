import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const mockPrisma = {
    extended: {
      team: {
        findUnique: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should calculate team stats correctly (Success)', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const mockTeam = {
      name: 'Development Team',
      projects: [
        {
          id: 101,
          name: 'Project X',
          _count: { tasks: 2 },
          tasks: [
            { status: TaskStatus.DONE, dueDate: null },
            { status: TaskStatus.IN_PROGRESS, dueDate: pastDate }, // Overdue
          ],
        },
      ],
    };

    mockPrisma.extended.team.findUnique.mockResolvedValue(mockTeam);

    const result = await service.getTeamStats(1);

    expect(result.teamName).toBe('Development Team');
    expect(result.projects[0].progress).toBe(50); // 1 done of 2
    expect(result.projects[0].overdueTasks).toBe(1);
    expect(result.projects[0].completedTasks).toBe(1);
  });

  it('should return 0 progress if project has no tasks', async () => {
    const mockTeam = {
      name: 'Empty Team',
      projects: [{ id: 1, name: 'Empty P', _count: { tasks: 0 }, tasks: [] }],
    };
    mockPrisma.extended.team.findUnique.mockResolvedValue(mockTeam);

    const result = await service.getTeamStats(1);
    expect(result.projects[0].progress).toBe(0);
  });

  it('should throw NotFoundException if team does not exist', async () => {
    mockPrisma.extended.team.findUnique.mockResolvedValue(null);
    await expect(service.getTeamStats(999)).rejects.toThrow(NotFoundException);
  });
});
