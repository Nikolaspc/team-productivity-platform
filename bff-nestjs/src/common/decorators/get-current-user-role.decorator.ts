import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export const GetCurrentUserRole = createParamDecorator(
  (data: unknown, context: ExecutionContext): Role | null => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user ? user.role : null;
  },
);
