import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { GetCurrentUser } from './get-current-user.decorator';

function getDecoratorFactory(decorator: any) {
  class Test {
    test(@decorator() value: any) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

describe('GetCurrentUser Decorator', () => {
  const factory = getDecoratorFactory(GetCurrentUser);

  it('should return full user if no data provided', () => {
    const mockUser = { id: 1, email: 'test@test.com' };
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ user: mockUser }) }),
    } as unknown as ExecutionContext;

    expect(factory(undefined, context)).toEqual(mockUser);
  });

  it('should return specific property if data provided', () => {
    const mockUser = { id: 1, email: 'test@test.com' };
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ user: mockUser }) }),
    } as unknown as ExecutionContext;

    expect(factory('email', context)).toBe('test@test.com');
  });
});
