import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';
import { ArgumentsHost } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

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

  beforeEach(() => {
    filter = new AllExceptionsFilter();
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
        timestamp: expect.any(String),
        path: '/test-url',
        method: 'POST',
        message: 'Forbidden Access',
      }),
    );
  });

  it('should catch unknown errors and return 500 (Internal Server Error)', () => {
    const exception = new Error('Database connection failed');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });

  it('should handle object-based exception messages (Validation Errors)', () => {
    const exceptionResponse = {
      message: ['email is invalid', 'password too short'],
      error: 'Bad Request',
    };
    const exception = new HttpException(
      exceptionResponse,
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ['email is invalid', 'password too short'],
      }),
    );
  });

  it('should handle string-based exception messages (Line 39 coverage)', () => {
    const exception = new HttpException(
      'Simple string error',
      HttpStatus.NOT_FOUND,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Simple string error',
      }),
    );
  });

  it('should log the error using Logger', () => {
    const loggerSpy = jest.spyOn((filter as any).logger, 'error');
    const exception = new Error('Critical failure');

    filter.catch(exception, mockArgumentsHost);

    expect(loggerSpy).toHaveBeenCalledWith(
      `[POST] /test-url - Status: 500`,
      exception.stack,
    );
  });
});
