import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { AtGuard } from '../../auth/guards/at.guard';
import { GetCurrentUserId } from '../../common/decorators';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('invitations')
@ApiBearerAuth()
@UseGuards(AtGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('team/:teamId/send')
  @ApiOperation({ summary: 'Send an email invitation to join a team' })
  async invite(
    @Param('teamId', ParseIntPipe) teamId: number,
    @GetCurrentUserId() userId: number,
    @Body('email') email: string,
    @Body('role') role: string = 'MEMBER',
  ) {
    return this.invitationsService.createInvitation(
      teamId,
      userId,
      email,
      role,
    );
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept a team invitation using a token' })
  async accept(
    @Body('token') token: string,
    @GetCurrentUserId() userId: number,
  ) {
    return this.invitationsService.acceptInvitation(token, userId);
  }
}
