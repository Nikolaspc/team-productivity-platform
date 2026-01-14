import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // English: If the route is @Public(), we don't care about roles.
    if (isPublic) {
      return true;
    }

    // 2. Obtener roles requeridos
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // English: If no roles are required by the @Roles decorator, let the user pass.
    if (!requiredRoles) {
      return true;
    }

    // 3. Obtener el usuario de la petición
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // English: Safety check if user is not present (this shouldn't happen with AtGuard active)
    if (!user || !user.role) {
      throw new ForbiddenException('User session not found or role missing');
    }

    // 4. Validar el rol
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
