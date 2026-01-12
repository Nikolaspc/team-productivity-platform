// src/projects/projects.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateProjectDto) {
    const isMember = await this.prisma.teamMember.findFirst({
      where: { userId, teamId: dto.teamId },
    });

    if (!isMember) {
      throw new ForbiddenException('User does not belong to this team');
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        teamId: dto.teamId,
      },
    });
  }

  async findAllByTeam(userId: number, teamId: number) {
    const isMember = await this.prisma.teamMember.findFirst({
      where: { userId, teamId },
    });

    if (!isMember) {
      throw new ForbiddenException('Access denied to this team');
    }

    return this.prisma.project.findMany({
      where: { teamId, deletedAt: null },
    });
  }
}
