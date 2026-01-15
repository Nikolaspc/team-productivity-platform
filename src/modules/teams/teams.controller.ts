import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { RolesGuard } from '../../common/guards/roles.guard'; // Path corrected
import { Roles } from '../../common/decorators/roles.decorator'; // Path corrected
import { Role } from '@prisma/client';
import { GetCurrentUserId } from '../../common/decorators'; // Path corrected
import { AtGuard } from '../../auth/guards/at.guard'; // Path corrected
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('teams')
@ApiBearerAuth('access-token')
@UseGuards(AtGuard, RolesGuard)
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Create a new team' })
  async create(@Body() dto: CreateTeamDto, @GetCurrentUserId() userId: number) {
    return this.teamsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List my teams' })
  async findAll(@GetCurrentUserId() userId: number) {
    return this.teamsService.findAllMyTeams(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team details' })
  async findOne(
    @Param('id', ParseIntPipe) teamId: number,
    @GetCurrentUserId() userId: number,
  ) {
    return this.teamsService.findOne(teamId, userId);
  }
}
