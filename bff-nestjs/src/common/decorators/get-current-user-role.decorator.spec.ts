import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { GetCurrentUserRole } from './get-current-user-role.decorator';

function getDecoratorFactory(decorator: any) {
  class Test {
    test(@decorator() value: any) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

describe('GetCurrentUserRole Decorator', () => {
  const factory = getDecoratorFactory(GetCurrentUserRole);

  it('should return user role', () => {
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'ADMIN' } }) }),
    } as unknown as ExecutionContext;

    expect(factory(undefined, context)).toBe('ADMIN');
  });

  it('should return null if no user', () => {
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ user: null }) }),
    } as unknown as ExecutionContext;

    expect(factory(undefined, context)).toBeNull();
  });
});
