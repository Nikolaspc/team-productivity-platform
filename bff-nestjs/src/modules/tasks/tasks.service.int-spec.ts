import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { StorageService } from '../../storage/storage.service';
import { ConfigModule } from '@nestjs/config';
import { TaskStatus } from '@prisma/client';

describe('TasksService (Integration)', () => {
  let service: TasksService;
  let prisma: PrismaService;

  // English: Mocks for external dependencies to focus on DB integration
  const mockNotifications = {
    notifyTaskUpdate: jest.fn(),
  };

  const mockStorage = {
    deleteFile: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        TasksService,
        PrismaService,
        { provide: NotificationsGateway, useValue: mockNotifications },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    // English: Clean up database state after each test
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create a task only if user has permission (is team member)', async () => {
    // 1. Arrange
    const user = await prisma.user.create({
      data: { email: 'dev@test.com', password: 'hash', name: 'Developer' },
    });

    const team = await prisma.team.create({
      data: { name: 'Dev Team' },
    });

    // Link user to team
    await prisma.teamMember.create({
      data: { userId: user.id, teamId: team.id, role: 'MEMBER' },
    });

    const project = await prisma.project.create({
      data: { name: 'New Project', teamId: team.id },
    });

    const dto = {
      title: 'Integrated Task',
      description: 'Test description',
      status: TaskStatus.TODO,
      projectId: project.id,
      assigneeId: user.id,
    };

    // 2. Act
    const task = await service.create(user.id, dto);

    // 3. Assert
    expect(task).toBeDefined();
    expect(task.title).toBe(dto.title);
    expect(mockNotifications.notifyTaskUpdate).toHaveBeenCalled();
  });

  it('should throw ForbiddenException if user is NOT in the team', async () => {
    // 1. Arrange: Create user and project but don't link them
    const stranger = await prisma.user.create({
      data: { email: 'stranger@test.com', password: 'hash' },
    });

    const team = await prisma.team.create({ data: { name: 'Private Team' } });
    const project = await prisma.project.create({
      data: { name: 'Private Project', teamId: team.id },
    });

    const dto = { title: 'Illegal Task', projectId: project.id };

    // 2. Act & Assert
    await expect(service.create(stranger.id, dto as any)).rejects.toThrow(
      'No permission to add tasks to this project',
    );
  });
});
