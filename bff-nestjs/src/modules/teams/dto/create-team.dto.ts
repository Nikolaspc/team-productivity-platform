import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({
    description: 'The name of the team',
    example: 'Engineering Team',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Team name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Team name cannot exceed 50 characters' })
  name!: string;
}
