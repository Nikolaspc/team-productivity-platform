import { TeamRole } from '@prisma/client';
export declare class SendInvitationDto {
    email: string;
    role: TeamRole;
}
export declare class AcceptInvitationDto {
    token: string;
}
