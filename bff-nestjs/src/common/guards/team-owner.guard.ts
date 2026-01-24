// bff-nestjs/src/common/guards/team-owner.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TeamRole, Role } from '@prisma/client';

@Injectable()
export class TeamOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // English: Global Admins can bypass owner checks (Enterprise Standard)
    if (user?.role === Role.ADMIN) return true;

    const userId = user?.sub;
    const teamIdRaw = request.params.id || request.params.teamId;
    const teamId = parseInt(teamIdRaw, 10);

    if (!userId || isNaN(teamId)) {
      throw new ForbiddenException('User session or Team ID not found');
    }

    // English: Verify ownership in the specific team
    const membership = await this.prisma.extended.teamMember.findUnique({
      where: {
        userId_teamId: { userId, teamId },
      },
    });

    if (!membership) {
      throw new NotFoundException('Team membership not found');
    }

    if (membership.role !== TeamRole.OWNER) {
      throw new ForbiddenException(
        'Only the team OWNER can perform this action',
      );
    }

    return true;
  }
}
