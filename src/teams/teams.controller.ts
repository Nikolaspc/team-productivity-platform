// src/teams/teams.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AtGuard } from '../auth/guards/at.guard';

@Controller('teams')
@UseGuards(AtGuard) // Protection: All endpoints require a valid JWT cookie
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTeamDto, @Req() req: any) {
    // User ID is extracted from the JWT payload by AtStrategy
    return this.teamsService.create(dto, req.user.userId);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.teamsService.findAllMyTeams(req.user.userId);
  }

  @Post(':id/invite')
  @HttpCode(HttpStatus.OK)
  async invite(
    @Param('id', ParseIntPipe) teamId: number,
    @Body() dto: InviteMemberDto,
    @Req() req: any,
  ) {
    return this.teamsService.inviteMember(teamId, req.user.userId, dto);
  }

  @Post('accept/:token')
  @HttpCode(HttpStatus.OK)
  async accept(@Param('token') token: string, @Req() req: any) {
    return this.teamsService.acceptInvitation(token, req.user.userId);
  }
}
