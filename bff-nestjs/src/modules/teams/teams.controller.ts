// bff-nestjs/src/modules/teams/teams.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';

// English: Using Path Aliases (@/) to fix TS2307 and ensure clean imports
import { GetCurrentUserId } from '@/common/decorators/get-current-user-id.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { TeamOwnerGuard } from '@/common/guards/team-owner.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AtGuard } from '@/auth/guards/at.guard';

@ApiTags('Teams')
@ApiBearerAuth('access-token')
@Controller('teams')
@UseGuards(AtGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new team' })
  create(@GetCurrentUserId() userId: number, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user teams' })
  findAll(@GetCurrentUserId() userId: number) {
    return this.teamsService.findAll(userId);
  }

  @Delete(':id')
  @UseGuards(TeamOwnerGuard) // English: Specific resource authorization for SaaS owners
  @ApiOperation({ summary: 'Soft-delete a team (Owner only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.remove(id);
  }
}
