// src/projects/projects.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { GetCurrentUserId, GetCurrentUserRole } from '../common/decorators';
import { Role } from '@prisma/client';

@Controller('teams/:teamId/projects')
@UseGuards(AtGuard, RolesGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  async create(
    @Param('teamId', ParseIntPipe) teamId: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUserRole() userRole: Role,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(userId, userRole, teamId, dto);
  }

  @Delete(':projectId')
  async remove(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUserRole() userRole: Role,
  ) {
    return this.projectsService.remove(userId, userRole, teamId, projectId);
  }
}
