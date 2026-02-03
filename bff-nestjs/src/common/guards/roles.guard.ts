import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, TeamRole } from '@prisma/client'; // Import both
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService, // English: Needed to check team membership
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // 2. Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId = parseInt(request.params.teamId);

    // 3. Global Admin Bypass (Enterprise Standard)
    if (user?.role === Role.ADMIN) {
      return true;
    }

    // 4. Validate Global Roles (if @Roles is present)
    if (requiredRoles && !requiredRoles.some((role) => user.role === role)) {
      throw new ForbiddenException('Missing required global role');
    }

    // 5. Team Context Validation (Logic for Team Roles)
    // English: If the URL contains a teamId, we must verify membership
    if (teamId) {
      const membership = await this.prisma.teamMember.findUnique({
        where: {
          userId_teamId: { userId: user.sub, teamId: teamId },
        },
      });

      if (!membership) {
        throw new ForbiddenException('You are not a member of this team');
      }

      // English: Attach membership to request for easy access in controllers
      request.user.teamRole = membership.role;
    }

    return true;
  }
}
