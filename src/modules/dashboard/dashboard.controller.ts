import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard) // English: Crucial - verified team membership automatically
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('team/:teamId')
  async getStats(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.dashboardService.getTeamStats(teamId);
  }
}
