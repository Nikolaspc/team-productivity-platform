// src/teams/dto/invite-member.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase()) // Better: use transformer for normalization
  email: string;
}
