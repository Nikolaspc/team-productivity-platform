import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { GetCurrentUserId } from '../common/decorators';
import { RolesGuard } from '../common/guards/roles.guard';
import { AtGuard } from '../auth/guards/at.guard';

@ApiTags('projects')
// English: This name 'access-token' must match exactly the name used in DocumentBuilder in main.ts
@ApiBearerAuth('access-token')
@UseGuards(AtGuard) // English: Ensure the user is authenticated before checking roles
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(Role.ADMIN) // English: Only users with ADMIN role can access this
  @UseGuards(RolesGuard) // English: Guard that validates the @Roles decorator
  @ApiOperation({ summary: 'Create a new project' })
  async create(
    @Body() dto: CreateProjectDto,
    @GetCurrentUserId() userId: number, // English: Extract user ID from JWT payload
  ) {
    return this.projectsService.create(userId, dto);
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: 'List all projects for a team' })
  async findAll(
    @Param('teamId', ParseIntPipe) teamId: number,
    @GetCurrentUserId() userId: number,
  ) {
    return this.projectsService.findAllByTeam(userId, teamId);
  }
}
