import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { GetCurrentUserId } from './get-current-user-id.decorator';

function getDecoratorFactory(decorator: any) {
  class Test {
    test(@decorator() value: any) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

describe('GetCurrentUserId Decorator', () => {
  const factory = getDecoratorFactory(GetCurrentUserId);

  it('should return user sub from request', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub: 123 },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(factory(undefined, mockContext)).toBe(123);
  });

  it('should return null if no user is present', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    expect(factory(undefined, mockContext)).toBeNull();
  });
});
