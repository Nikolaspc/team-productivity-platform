import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockResolvedValue({ id: 1 }),
            },
            extended: {
              user: {
                create: jest.fn().mockResolvedValue({ id: 1 }),
              },
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('development'),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should return "Hello World!"', async () => {
      // English: Using mockResolvedValue because the method is now asynchronous (returns a Promise)
      jest.spyOn(appController, 'getHello').mockResolvedValue('Hello World!');

      const result = await appController.getHello();
      expect(result).toBe('Hello World!');
    });
  });
});
