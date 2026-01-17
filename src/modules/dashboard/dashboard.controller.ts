import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('team/:teamId')
  // English: We use ParseIntPipe to ensure teamId is a number
  async getStats(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.dashboardService.getTeamStats(teamId);
  }
}
