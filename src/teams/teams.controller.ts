import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetCurrentUserId } from '../common/decorators';
import { AtGuard } from '../auth/guards/at.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('teams')
// English: This name 'access-token' MUST match the name in main.ts
@ApiBearerAuth('access-token')
@UseGuards(AtGuard, RolesGuard) // English: Order matters: 1. Verify Token, 2. Verify Role
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  @Roles(Role.ADMIN) // English: Only users with ADMIN role can create teams
  async create(@Body() dto: CreateTeamDto, @GetCurrentUserId() userId: number) {
    return this.teamsService.create(dto, userId);
  }
}
