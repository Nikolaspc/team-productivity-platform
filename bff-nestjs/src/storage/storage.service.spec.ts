import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({}),
    })),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
  };
});

describe('StorageService', () => {
  let service: StorageService;
  let config: ConfigService;
  let s3ClientInstance: any;

  const mockConfig = {
    get: jest.fn((key: string) => {
      const configMap = {
        STORAGE_REGION: 'us-east-1',
        STORAGE_ENDPOINT: 'http://localhost:9000',
        STORAGE_ACCESS_KEY: 'key',
        STORAGE_SECRET_KEY: 'secret',
        STORAGE_BUCKET: 'my-bucket',
      };
      return configMap[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    config = module.get<ConfigService>(ConfigService);

    // Retrieve the mocked instance created during service instantiation
    s3ClientInstance = (S3Client as jest.Mock).mock.results[0].value;
  });

  it('should upload a file and return the URL', async () => {
    const mockFile = {
      originalname: 'test.png',
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    } as any;

    const url = await service.uploadFile(mockFile);

    expect(url).toContain('http://localhost:9000/my-bucket/task-attachments/');
    expect(url).toContain('test.png');
  });

  it('should delete a file successfully', async () => {
    const fileUrl =
      'http://localhost:9000/my-bucket/task-attachments/123-test.png';
    await expect(service.deleteFile(fileUrl)).resolves.not.toThrow();
  });

  it('should throw error if bucket marker is not found in URL', async () => {
    const invalidUrl = 'http://localhost:9000/wrong-marker/file.png';
    await expect(service.deleteFile(invalidUrl)).rejects.toThrow(
      'Bucket marker /my-bucket/ not found in URL',
    );
  });

  it('should log and rethrow error if S3 delete fails', async () => {
    // Force the send method to reject for this specific test
    jest
      .spyOn(s3ClientInstance, 'send')
      .mockRejectedValueOnce(new Error('S3 Failure'));

    const fileUrl =
      'http://localhost:9000/my-bucket/task-attachments/123-test.png';

    await expect(service.deleteFile(fileUrl)).rejects.toThrow('S3 Failure');
  });
});
