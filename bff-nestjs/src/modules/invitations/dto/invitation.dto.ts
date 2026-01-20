import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TeamRole } from '@prisma/client';

export class SendInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string; // English: Added '!' to fix TS2564 Property has no initializer

  @IsEnum(TeamRole)
  role: TeamRole = TeamRole.MEMBER;
}

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty()
  token!: string; // English: Added '!' to fix TS2564 Property has no initializer
}
