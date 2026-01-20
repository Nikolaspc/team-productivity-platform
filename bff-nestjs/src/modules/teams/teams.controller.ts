import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Teams')
@ApiBearerAuth('access-token')
@Controller('teams')
@UseGuards(RolesGuard) // English: Active for all endpoints in this controller
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN) // English: Any registered user can create a team
  @ApiOperation({ summary: 'Create a new team' })
  create(@GetCurrentUserId() userId: number, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user teams' })
  findAll(@GetCurrentUserId() userId: number) {
    return this.teamsService.findAll(userId);
  }
}
