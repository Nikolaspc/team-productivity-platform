import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): number | null => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user ? (user as any).sub : null;
  },
);
