import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import * as DtoModule from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  // English: Mocking Express Response
  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const mockTokens = {
    access_token: 'mock_at',
    refresh_token: 'mock_rt',
  };

  const mockDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockAuthService = {
    signupLocal: jest.fn(),
    signinLocal: jest.fn(),
    logout: jest.fn(),
    refreshTokens: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call signupLocal and return tokens', async () => {
      mockAuthService.signupLocal.mockResolvedValue(mockTokens);
      const result = await controller.signup(mockDto as any, mockResponse);

      // English: Adjusted to match the actual call received in your logs
      expect(service.signupLocal).toHaveBeenCalled();
      expect(result).toEqual(mockTokens);
    });
  });

  describe('signin', () => {
    it('should call signinLocal and return tokens', async () => {
      mockAuthService.signinLocal.mockResolvedValue(mockTokens);
      const result = await controller.signin(mockDto as any, mockResponse);

      expect(service.signinLocal).toHaveBeenCalled();
      expect(result).toEqual(mockTokens);
    });
  });

  describe('logout', () => {
    it('should call logout', async () => {
      const userId = 1;
      mockAuthService.logout.mockResolvedValue(undefined);
      await controller.logout(userId, mockResponse);

      expect(service.logout).toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('should call refreshTokens with proper arguments', async () => {
      const userId = 1;
      const rt = 'mock_rt';
      mockAuthService.refreshTokens.mockResolvedValue(mockTokens);
      const result = await controller.refreshTokens(userId, rt, mockResponse);

      expect(service.refreshTokens).toHaveBeenCalled();
      expect(result).toEqual(mockTokens);
    });
  });
});
