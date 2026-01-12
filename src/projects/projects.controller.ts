// src/projects/projects.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js'; // Nota: En nodenext a veces requiere .js en el import
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as express from 'express';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  async create(@Body() dto: CreateProjectDto, @Req() req: express.Request) {
    // English: The user object is injected by the AuthGuard into the request
    const user = req.user as { sub: number };
    return this.projectsService.create(user.sub, dto);
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: 'List all projects for a team' })
  async findAll(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Req() req: express.Request,
  ) {
    const user = req.user as { sub: number };
    return this.projectsService.findAllByTeam(user.sub, teamId);
  }
}
