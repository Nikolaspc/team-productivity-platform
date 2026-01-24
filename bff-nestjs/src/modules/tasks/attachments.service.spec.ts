import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsService } from './attachments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let prisma: PrismaService;
  let storage: StorageService;

  const mockAttachment = {
    id: 1,
    filename: 'test.jpg',
    url: 'https://iaqnnevdkhpkpyrwecfh.storage.supabase.co/storage/v1/s3/attachments/task-attachments/1769252065725-test.jpg',
    taskId: 101,
    mimetype: 'image/jpeg',
    size: 1024,
    createdAt: new Date('2026-01-24T10:54:26.899Z'),
    updatedAt: new Date('2026-01-24T10:54:26.899Z'),
    deletedAt: null as Date | null,
  };

  const mockStorageService = {
    deleteFile: jest.fn().mockResolvedValue(undefined),
  };

  const mockPrismaService = {
    extended: {
      attachment: {
        create: jest.fn().mockResolvedValue(mockAttachment),
        findFirst: jest.fn(),
      },
    },
    // English: Use standard attachment for write operations (not extended)
    attachment: {
      update: jest.fn().mockResolvedValue({
        ...mockAttachment,
        deletedAt: new Date('2026-01-24T12:26:16.240Z'),
        updatedAt: new Date('2026-01-24T12:26:16.242Z'),
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentsService,
        { provide: StorageService, useValue: mockStorageService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AttachmentsService>(AttachmentsService);
    prisma = module.get<PrismaService>(PrismaService);
    storage = module.get<StorageService>(StorageService);

    // English: Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an attachment successfully', async () => {
      const fileData = {
        filename: 'test.jpg',
        url: mockAttachment.url,
        mimetype: 'image/jpeg',
        size: 1024,
      };

      const result = await service.create(101, fileData);

      expect(mockPrismaService.extended.attachment.create).toHaveBeenCalledWith(
        {
          data: {
            ...fileData,
            taskId: 101,
          },
        },
      );
      expect(result).toEqual(mockAttachment);
    });
  });

  describe('findOne', () => {
    it('should return an attachment when found', async () => {
      (
        mockPrismaService.extended.attachment.findFirst as jest.Mock
      ).mockResolvedValue(mockAttachment);

      const result = await service.findOne(1);

      expect(
        mockPrismaService.extended.attachment.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          id: 1,
          deletedAt: null,
        },
      });
      expect(result).toEqual(mockAttachment);
    });

    it('should throw NotFoundException when attachment not found', async () => {
      (
        mockPrismaService.extended.attachment.findFirst as jest.Mock
      ).mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when attachment is soft-deleted', async () => {
      (
        mockPrismaService.extended.attachment.findFirst as jest.Mock
      ).mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        'Attachment with ID 1 not found',
      );
    });
  });

  describe('remove', () => {
    it('should perform soft delete in database regardless of storage errors', async () => {
      // English: Mock findOne to return the attachment
      (
        mockPrismaService.extended.attachment.findFirst as jest.Mock
      ).mockResolvedValue(mockAttachment);

      // English: Mock storage error - should not prevent soft delete
      (mockStorageService.deleteFile as jest.Mock).mockRejectedValue(
        new Error('Storage service error'),
      );

      const result = await service.remove(1);

      // English: Verify soft delete was executed despite storage error
      expect(mockPrismaService.attachment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });

      // English: Verify deletion from storage was attempted
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        mockAttachment.url,
      );

      // English: Verify soft delete result is returned
      expect(result.deletedAt).toBeDefined();
      expect(result.deletedAt).not.toBeNull();
    });

    it('should successfully soft-delete and delete from storage', async () => {
      // English: Mock both operations succeeding
      (
        mockPrismaService.extended.attachment.findFirst as jest.Mock
      ).mockResolvedValue(mockAttachment);

      const result = await service.remove(1);

      // English: Verify database update
      expect(mockPrismaService.attachment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });

      // English: Verify storage deletion was called
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        mockAttachment.url,
      );

      // English: Verify the result has deletedAt populated
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('should throw InternalServerErrorException if database update fails', async () => {
      (
        mockPrismaService.extended.attachment.findFirst as jest.Mock
      ).mockResolvedValue(mockAttachment);

      (mockPrismaService.attachment.update as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.remove(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw NotFoundException if attachment does not exist', async () => {
      (
        mockPrismaService.extended.attachment.findFirst as jest.Mock
      ).mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should log warning but not throw if storage deletion fails', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'warn');

      // English: Setup mocks
      (
        mockPrismaService.extended.attachment.findFirst as jest.Mock
      ).mockResolvedValue(mockAttachment);

      // English: Make storage deletion fail
      (mockStorageService.deleteFile as jest.Mock).mockRejectedValue(
        new Error('Storage connection timeout'),
      );

      // English: Make database update succeed
      const softDeletedAttachment = {
        ...mockAttachment,
        deletedAt: new Date('2026-01-24T12:26:16.240Z'),
        updatedAt: new Date('2026-01-24T12:26:16.242Z'),
      };
      (mockPrismaService.attachment.update as jest.Mock).mockResolvedValue(
        softDeletedAttachment,
      );

      const result = await service.remove(1);

      // English: Verify soft delete completed successfully
      expect(result.deletedAt).toBeDefined();
      expect(result.id).toBe(1);

      // English: Verify warning was logged for storage error
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete attachment'),
      );
    });
  });
});
