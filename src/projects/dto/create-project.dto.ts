import {
  IsNotEmpty,
  IsString,
  IsInt,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'The name of the project',
    example: 'Marketing Campaign',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @ApiProperty({
    description: 'A brief description of the project purpose',
    example: 'Project focused on Q1 social media growth',
    required: false, // English: Not required in Swagger UI
  })
  @IsString()
  @IsOptional() // English: Crucial to avoid the "should not exist" error
  description?: string;

  @ApiProperty({
    description: 'The ID of the team this project belongs to',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  teamId!: number;
}
