import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateProjectDto) {
    // English: 1. Check if the team exists first
    const team = await this.prisma.team.findUnique({
      where: { id: dto.teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${dto.teamId} not found`);
    }

    // English: 2. Verify membership or Admin status
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isMember = await this.prisma.teamMember.findFirst({
      where: { userId, teamId: dto.teamId },
    });

    // English: Only block if user is NOT a member AND NOT an ADMIN
    if (!isMember && user?.role !== Role.ADMIN) {
      throw new ForbiddenException('User does not belong to this team');
    }

    // English: 3. Create project including the description from DTO
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description, // English: Added from the updated DTO
        teamId: dto.teamId,
      },
    });
  }

  async findAllByTeam(userId: number, teamId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isMember = await this.prisma.teamMember.findFirst({
      where: { userId, teamId },
    });

    if (!isMember && user?.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied to this team');
    }

    return this.prisma.project.findMany({
      where: {
        teamId,
        deletedAt: null, // English: Assumes your schema has soft delete enabled
      },
    });
  }
}
