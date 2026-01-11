// src/teams/dto/create-team.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  // Validating a minimum length ensures team names are meaningful
  @MinLength(3, { message: 'Team name must be at least 3 characters long' })
  name: string;
}
