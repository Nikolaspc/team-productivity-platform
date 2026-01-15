import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AtGuard } from '../../auth/guards/at.guard'; // Path corrected
import type { Request } from 'express';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(AtGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('team/:teamId')
  @ApiOperation({ summary: 'Get KPIs and statistics for a specific team' })
  async getStats(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Req() req: Request,
  ) {
    // English: Using 'sub' or 'userId' depending on your JWT payload structure
    const user = req.user as any;
    const userId = user.sub || user.userId;
    return this.dashboardService.getTeamStats(userId, teamId);
  }
}
