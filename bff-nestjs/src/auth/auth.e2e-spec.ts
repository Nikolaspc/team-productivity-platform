import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// English: Using a wildcard import if you are unsure of the name,
// or update 'AuthDto' to 'CreateAuthDto' if that is the class name.
import * as Dtos from './dto/auth.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  // English: Mocking Express Response for cookie management
  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  const mockTokens = {
    access_token: 'at_token',
    refresh_token: 'rt_token',
  };

  // English: Accessing the DTO from the wildcard import to avoid TS2305
  // Note: Replace 'AuthDto' with 'CreateAuthDto' if needed
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
      expect(service.signupLocal).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('signin', () => {
    it('should call signinLocal and return tokens', async () => {
      mockAuthService.signinLocal.mockResolvedValue(mockTokens);
      const result = await controller.signin(mockDto as any, mockResponse);
      expect(service.signinLocal).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('logout', () => {
    it('should call logout and handle response', async () => {
      const userId = 1;
      mockAuthService.logout.mockResolvedValue(true);
      await controller.logout(userId, mockResponse);
      expect(service.logout).toHaveBeenCalledWith(userId);
    });
  });

  describe('refreshTokens', () => {
    it('should call refreshTokens with correct params', async () => {
      const userId = 1;
      const rt = 'refresh_token';
      mockAuthService.refreshTokens.mockResolvedValue(mockTokens);
      const result = await controller.refreshTokens(userId, rt, mockResponse);
      expect(service.refreshTokens).toHaveBeenCalledWith(userId, rt);
      expect(result).toEqual(mockTokens);
    });
  });
});
