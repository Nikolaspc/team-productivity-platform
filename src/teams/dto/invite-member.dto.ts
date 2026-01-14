import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InviteMemberDto {
  @ApiProperty({
    description: 'Email address of the user to invite',
    example: 'colleague@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  // English: Normalizes email to lowercase before validation and persistence
  @Transform(({ value }) => value?.trim().toLowerCase())
  email!: string; // English: Fixed TS2564 with !
}
