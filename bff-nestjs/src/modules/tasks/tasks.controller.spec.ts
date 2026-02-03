import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { StorageService } from '../../storage/storage.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from '@prisma/client';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: TasksService;
  let storageService: StorageService;

  const mockUserId = 1;

  // English: Comprehensive mocks for all services used in the controller
  const mockTasksService = {
    create: jest.fn(),
    findAllByProject: jest.fn(),
    addAttachment: jest.fn(),
    removeAttachment: jest.fn(),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: mockTasksService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
    storageService = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call tasksService.create with userId and dto', async () => {
      const dto: CreateTaskDto = {
        title: 'New Task',
        projectId: 1,
        status: TaskStatus.TODO,
      };
      mockTasksService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(mockUserId, dto);

      expect(tasksService.create).toHaveBeenCalledWith(mockUserId, dto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should call tasksService.findAllByProject with correct params', async () => {
      const projectId = 10;
      mockTasksService.findAllByProject.mockResolvedValue([]);

      await controller.findAll(projectId, mockUserId);

      expect(tasksService.findAllByProject).toHaveBeenCalledWith(mockUserId, projectId);
    });
  });

  describe('uploadFile', () => {
    it('should upload to storage and then add attachment to DB', async () => {
      const taskId = 123;
      const mockFile = {
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 5000,
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const mockUrl = 'http://cloud.storage/test.png';
      mockStorageService.uploadFile.mockResolvedValue(mockUrl);
      mockTasksService.addAttachment.mockResolvedValue({ id: 1, url: mockUrl });

      const result = await controller.uploadFile(taskId, mockFile);

      // English: Verify the sequential flow: Storage first, then DB
      expect(storageService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(tasksService.addAttachment).toHaveBeenCalledWith(taskId, {
        filename: mockFile.originalname,
        url: mockUrl,
        mimetype: mockFile.mimetype,
        size: mockFile.size,
      });
      expect(result.url).toBe(mockUrl);
    });
  });

  describe('removeAttachment', () => {
    it('should call tasksService.removeAttachment', async () => {
      const attachmentId = 99;
      mockTasksService.removeAttachment.mockResolvedValue({ success: true });

      await controller.removeAttachment(attachmentId);

      expect(tasksService.removeAttachment).toHaveBeenCalledWith(attachmentId);
    });
  });
});
