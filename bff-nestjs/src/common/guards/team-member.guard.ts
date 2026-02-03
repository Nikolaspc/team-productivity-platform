// src/common/guards/team-member.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeamMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub;
    const teamId = parseInt(request.params.teamId || request.body.teamId);

    if (!teamId) {
      return true;
    } // English: Skip if no team context is provided

    const membership = await this.prisma.extended.teamMember.findFirst({
      where: {
        userId,
        teamId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Access Denied: You do not belong to this team');
    }

    return true;
  }
}
