// src/teams/teams.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { TeamsService } from './teams.service.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamsController {
  private readonly logger = new Logger(TeamsController.name);

  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({
    status: 201,
    description: 'The team has been successfully created.',
  })
  async create(@Body() dto: CreateTeamDto, @Req() req: Request) {
    const user = req.user as any;
    // English: Extracted userId from the request object as identified in previous logs
    const userId = user?.userId;

    if (!userId) {
      this.logger.error(
        'User ID not found in req.user. Ensure AtGuard is working.',
      );
      throw new InternalServerErrorException(
        'Session invalid or user context missing',
      );
    }

    return this.teamsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams for the current user' })
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    const userId = user?.userId;
    return this.teamsService.findAllMyTeams(userId);
  }

  @Post(':id/invite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invite a member to the team' })
  async invite(
    @Param('id', ParseIntPipe) teamId: number,
    @Body() dto: InviteMemberDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const userId = user?.userId;
    return this.teamsService.inviteMember(teamId, userId, dto);
  }

  @Post('accept/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an invitation to join a team' })
  async accept(@Param('token') token: string, @Req() req: Request) {
    const user = req.user as any;
    const userId = user?.userId;
    return this.teamsService.acceptInvitation(token, userId);
  }
}
