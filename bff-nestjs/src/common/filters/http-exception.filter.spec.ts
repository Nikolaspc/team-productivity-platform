import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let configService: ConfigService;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const mockRequest = {
    url: '/test-url',
    method: 'POST',
  };

  const mockArgumentsHost = {
    switchToHttp: jest.fn().mockReturnThis(),
    getResponse: jest.fn().mockReturnValue(mockResponse),
    getRequest: jest.fn().mockReturnValue(mockRequest),
  } as unknown as ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'NODE_ENV') return 'development';
              return null;
            }),
          },
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
    configService = module.get<ConfigService>(ConfigService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and return formatted response', () => {
    const exception = new HttpException(
      'Forbidden Access',
      HttpStatus.FORBIDDEN,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden Access',
      }),
    );
  });

  it('should show detailed error message when NOT in production', () => {
    const exception = new Error('Database connection failed');
    jest.spyOn(configService, 'get').mockReturnValue('development');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Database connection failed',
      }),
    );
  });

  it('should hide detailed error message when in production (GDPR compliance)', () => {
    const exception = new Error('Sensitive database error');
    jest.spyOn(configService, 'get').mockReturnValue('production');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
      }),
    );
  });

  it('should log the error with the new structured format', () => {
    const loggerSpy = jest.spyOn((filter as any).logger, 'error');
    const exception = new Error('Critical failure');

    filter.catch(exception, mockArgumentsHost);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[POST] /test-url - Status: 500 - Error: Critical failure',
      ),
      exception.stack,
    );
  });
});
