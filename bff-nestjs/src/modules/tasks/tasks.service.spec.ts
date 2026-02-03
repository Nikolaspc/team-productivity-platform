import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { StorageService } from '../../storage/storage.service';
import { AttachmentsService } from './attachments.service';
import {
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;
  let storageService: StorageService;
  let notifications: NotificationsGateway;
  let attachmentsService: AttachmentsService;

  const mockPrisma = {
    extended: {
      project: { findUnique: jest.fn(), findFirst: jest.fn() },
      task: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
    },
  };

  const mockNotifications = { notifyTaskUpdate: jest.fn() };
  const mockStorageService = { deleteFile: jest.fn() };
  const mockAttachmentsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsGateway, useValue: mockNotifications },
        { provide: StorageService, useValue: mockStorageService },
        { provide: AttachmentsService, useValue: mockAttachmentsService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
    storageService = module.get<StorageService>(StorageService);
    notifications = module.get<NotificationsGateway>(NotificationsGateway);
    attachmentsService = module.get<AttachmentsService>(AttachmentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw ForbiddenException if user is not a member (Line 35)', async () => {
      mockPrisma.extended.project.findUnique.mockResolvedValue({
        team: { members: [] },
      });
      await expect(service.create(1, { projectId: 1 } as any)).rejects.toThrow(ForbiddenException);
    });

    it('should handle notification failure (Line 47-51)', async () => {
      mockPrisma.extended.project.findUnique.mockResolvedValue({
        teamId: 1,
        team: { members: [{ userId: 1 }] },
      });
      mockPrisma.extended.task.create.mockResolvedValue({
        id: 1,
        title: 'Test',
      });
      mockNotifications.notifyTaskUpdate.mockImplementation(() => {
        throw new Error();
      });

      const result = await service.create(1, {
        projectId: 1,
        title: 'Test',
      } as any);
      expect(result).toBeDefined();
    });
  });

  describe('addAttachment', () => {
    it('should throw NotFoundException if task not found (Line 76)', async () => {
      mockPrisma.extended.task.findUnique.mockResolvedValue(null);
      await expect(service.addAttachment(999, {} as any)).rejects.toThrow(NotFoundException);
    });

    it('should call attachmentsService.create if task exists', async () => {
      mockPrisma.extended.task.findUnique.mockResolvedValue({ id: 1 });
      await service.addAttachment(1, { url: 'test' } as any);
      expect(attachmentsService.create).toHaveBeenCalled();
    });
  });

  describe('removeAttachment', () => {
    it('should handle generic error in catch and log it (Line 89)', async () => {
      mockAttachmentsService.findOne.mockResolvedValue({
        id: 1,
        url: 'http://test.com/file.png',
      });
      // English: Using a real Error object to hit the 'error instanceof Error' branch on line 89
      mockStorageService.deleteFile.mockRejectedValue(new Error('S3 Fail'));

      await expect(service.removeAttachment(1)).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle non-Error objects in catch (Lines 90-93)', async () => {
      mockAttachmentsService.findOne.mockResolvedValue({ url: 'url' });
      mockStorageService.deleteFile.mockRejectedValue('Fatal String Error');
      await expect(service.removeAttachment(1)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAllByProject', () => {
    it('should throw ForbiddenException if project access denied', async () => {
      mockPrisma.extended.project.findFirst.mockResolvedValue(null);
      await expect(service.findAllByProject(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should return tasks with assignee and attachments', async () => {
      mockPrisma.extended.project.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.extended.task.findMany.mockResolvedValue([{ id: 1 }]);
      const res = await service.findAllByProject(1, 1);
      expect(res).toHaveLength(1);
    });
  });
});
