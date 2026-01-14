import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;

  const mockPrisma = {
    task: { create: jest.fn() },
    project: { findUnique: jest.fn() },
  };

  const mockGateway = { notifyTaskUpdate: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // English: Test to verify task creation logic
  it('should create a task and notify via websocket', async () => {
    const dto = { title: 'Test Task', projectId: 1 };
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 1,
      teamId: 10,
      team: { members: [{ userId: 1 }] },
    });
    mockPrisma.task.create.mockResolvedValue({ id: 99, title: 'Test Task' });

    const result = await service.create(1, dto as any);

    expect(result.id).toEqual(99);
    expect(mockGateway.notifyTaskUpdate).toHaveBeenCalled();
  });
});
