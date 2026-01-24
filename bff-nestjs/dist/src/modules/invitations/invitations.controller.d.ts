import { InvitationsService } from './invitations.service';
import { SendInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
export declare class InvitationsController {
    private readonly invitationsService;
    constructor(invitationsService: InvitationsService);
    invite(teamId: number, userId: number, dto: SendInvitationDto): Promise<{
        message: string;
        invitationId: number;
    }>;
    accept(dto: AcceptInvitationDto, userId: number): Promise<{
        message: string;
    }>;
}
