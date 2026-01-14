// src/dashboard/dashboard.controller.ts
import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('team/:teamId')
  @ApiOperation({ summary: 'Get KPIs and statistics for a specific team' })
  async getStats(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Req() req: Request,
  ) {
    const user = req.user as { sub: number };
    return this.dashboardService.getTeamStats(user.sub, teamId);
  }
}
