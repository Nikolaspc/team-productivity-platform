import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsService } from './attachments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let prisma: PrismaService;

  const mockAttachment = {
    id: 1,
    filename: 'test.txt',
    url: 'http://test.com',
    taskId: 101,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentsService,
        {
          provide: PrismaService,
          useValue: {
            extended: {
              attachment: {
                create: jest.fn().mockResolvedValue(mockAttachment),
                findUnique: jest.fn(),
                delete: jest.fn().mockResolvedValue(mockAttachment),
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<AttachmentsService>(AttachmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create an attachment', async () => {
    const result = await service.create(101, {
      filename: 'a',
      url: 'b',
      mimetype: 'c',
      size: 1,
    });
    expect(result).toEqual(mockAttachment);
  });

  describe('findOne', () => {
    it('should return attachment if found', async () => {
      (prisma.extended.attachment.findUnique as jest.Mock).mockResolvedValue(
        mockAttachment,
      );
      expect(await service.findOne(1)).toEqual(mockAttachment);
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.extended.attachment.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should call delete', async () => {
      const result = await service.remove(1);
      expect(result).toEqual(mockAttachment);
    });
  });
});
