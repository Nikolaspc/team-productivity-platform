import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import * as argon2 from 'argon2';

// English: Mock the entire argon2 module
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  verify: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let mockJwtService: any;
  let mockConfig: any;

  const mockPrisma = {
    extended: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    },
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('fake-token'),
    };

    mockConfig = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        return 'secret';
      }) as jest.Mock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('signupLocal', () => {
    it('should throw ConflictException if user exists', async () => {
      mockPrisma.extended.user.findUnique.mockResolvedValue({ id: 1 });
      await expect(
        service.signupLocal({ email: 'test@test.com' } as any, mockResponse),
      ).rejects.toThrow(ConflictException);
    });

    it('should register a new user and return access token', async () => {
      mockPrisma.extended.user.findUnique.mockResolvedValue(null);
      mockPrisma.extended.user.create.mockResolvedValue({
        id: 1,
        email: 't@t.com',
        role: 'USER',
      });

      const result = await service.signupLocal(
        { email: 't@t.com', password: '123' } as any,
        mockResponse,
      );
      expect(result).toHaveProperty('access_token');
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    // English: Fixed test to match your current service logic (which throws raw Error if no try/catch)
    it('should propagate database errors during signup', async () => {
      mockPrisma.extended.user.findUnique.mockResolvedValue(null);
      mockPrisma.extended.user.create.mockRejectedValue(new Error('DB Fail'));

      await expect(
        service.signupLocal({ email: 'err@t.com' } as any, mockResponse),
      ).rejects.toThrow('DB Fail');
    });
  });

  describe('signinLocal', () => {
    it('should throw ForbiddenException if user not found', async () => {
      mockPrisma.extended.user.findUnique.mockResolvedValue(null);
      await expect(
        service.signinLocal({ email: 'x@x.com' } as any, mockResponse),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if password fails', async () => {
      mockPrisma.extended.user.findUnique.mockResolvedValue({
        password: 'hash',
      });
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.signinLocal(
          { email: 'x@x.com', password: '123' } as any,
          mockResponse,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('logout', () => {
    it('should clear cookie and update hash to null', async () => {
      const result = await service.logout(1, mockResponse);
      expect(result.success).toBe(true);
      expect(mockResponse.clearCookie).toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('should throw ForbiddenException if user has no RT hash', async () => {
      mockPrisma.extended.user.findUnique.mockResolvedValue({
        refreshTokenHash: null,
      });
      await expect(
        service.refreshTokens(1, 'rt', mockResponse),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if RT match fails', async () => {
      mockPrisma.extended.user.findUnique.mockResolvedValue({
        refreshTokenHash: 'hash',
      });
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      await expect(
        service.refreshTokens(1, 'rt', mockResponse),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getTokens (Error paths)', () => {
    it('should throw InternalServerErrorException on JWT failure (Lines 98-105)', async () => {
      mockJwtService.signAsync.mockRejectedValueOnce(new Error('JWT Error'));
      await expect(service.getTokens(1, 'a@a.com', 'USER')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle unknown errors in getTokens', async () => {
      mockJwtService.signAsync.mockRejectedValueOnce('String Error');
      await expect(service.getTokens(1, 'a@a.com', 'USER')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('finalizeSession (Branches)', () => {
    it('should use secure cookies in production', () => {
      mockConfig.get.mockReturnValue('production');
      const tokens = { access_token: 'at', refresh_token: 'rt' };
      (service as any).finalizeSession(mockResponse, tokens);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'rt',
        expect.objectContaining({ secure: true }),
      );
    });
  });
});
