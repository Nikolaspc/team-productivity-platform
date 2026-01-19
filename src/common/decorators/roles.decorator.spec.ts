import { Roles, ROLES_KEY } from './roles.decorator';
import { Role } from '@prisma/client';

describe('Roles Decorator', () => {
  it('should set the correct metadata key and values', () => {
    const roles: Role[] = ['ADMIN', 'USER'];
    const decorator = Roles(...roles);

    // English: Create a dummy class to apply the decorator
    const TestTarget = class {};
    decorator(TestTarget);

    const metadata = Reflect.getMetadata(ROLES_KEY, TestTarget);
    expect(metadata).toEqual(roles);
  });
});
