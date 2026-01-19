import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AtGuard } from './at.guard';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

describe('AtGuard', () => {
  let guard: AtGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AtGuard>(AtGuard);
    reflector = module.get<Reflector>(Reflector);

    // English: Suppress logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockContext = {
    getHandler: jest.fn().mockReturnValue({ name: 'testHandler' }),
    getClass: jest.fn().mockReturnValue({ name: 'testClass' }),
  } as unknown as ExecutionContext;

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when the route is marked as public', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    // English: Match the objects exactly as they are returned by mockContext
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      { name: 'testHandler' },
      { name: 'testClass' },
    ]);
  });

  it('should call super.canActivate when the route is NOT public', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    // English: Correct way to mock the parent class method in NestJS/Passport
    const superCanActivateSpy = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(superCanActivateSpy).toHaveBeenCalled();
  });
});
