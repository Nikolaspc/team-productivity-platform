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
import { RolesGuard } from '../../common/guards/roles.guard';
import { GetCurrentUserId, GetCurrentUserRole } from '../../common/decorators';
import { Role, TeamRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@Controller('teams/:teamId/projects')
@UseGuards(RolesGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(teamId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List team projects' })
  findAll(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.projectsService.findAllByTeam(teamId);
  }

  @Delete(':projectId')
  @ApiOperation({ summary: 'Soft-delete a project' })
  remove(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUserRole() userRole: Role,
  ) {
    // Note: teamRole should be extracted from request.user if needed
    return this.projectsService.remove(teamId, projectId, userRole);
  }
}
