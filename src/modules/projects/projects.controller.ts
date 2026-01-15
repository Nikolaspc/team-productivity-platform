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
import { AtGuard } from '../../auth/guards/at.guard'; // Path corrected
import { RolesGuard } from '../../common/guards/roles.guard'; // Path corrected
import { GetCurrentUserId, GetCurrentUserRole } from '../../common/decorators'; // Path corrected
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('teams/:teamId/projects')
@UseGuards(AtGuard, RolesGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project within a team' })
  async create(
    @Param('teamId', ParseIntPipe) teamId: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUserRole() userRole: Role,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(userId, userRole, teamId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active projects of a team' })
  async findAll(
    @Param('teamId', ParseIntPipe) teamId: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUserRole() userRole: Role,
  ) {
    return this.projectsService.findAllByTeam(userId, userRole, teamId);
  }

  @Delete(':projectId')
  @ApiOperation({ summary: 'Soft-delete a project' })
  async remove(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUserRole() userRole: Role,
  ) {
    return this.projectsService.remove(userId, userRole, teamId, projectId);
  }
}
