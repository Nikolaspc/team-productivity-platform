import { Controller, Post, Body, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { AtGuard } from '../../auth/guards/at.guard';
import { GetCurrentUserId } from '../../common/decorators';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SendInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';

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
    @Body() dto: SendInvitationDto,
  ) {
    // English: Changed to createInvitation to match your Service method name
    return this.invitationsService.createInvitation(teamId, userId, dto.email, dto.role);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept a team invitation using a token' })
  async accept(@Body() dto: AcceptInvitationDto, @GetCurrentUserId() userId: number) {
    return this.invitationsService.acceptInvitation(dto.token, userId);
  }
}
