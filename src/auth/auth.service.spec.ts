import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as argon from 'argon2';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  // English: Mocking the Express Response object
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.cookie = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('mock_token') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('secret') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signupLocal', () => {
    it('should create a user and set cookies', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const res = mockResponse();

      // English: Simulate prisma returning a new user
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 1,
        email: dto.email,
        hash: await argon.hash(dto.password),
      });

      const result = await service.signupLocal(dto, res);

      expect(result).toHaveProperty('access_token');
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.any(String),
        expect.any(Object),
      );
    });
  });
});
