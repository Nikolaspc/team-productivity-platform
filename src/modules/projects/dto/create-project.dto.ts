import {
  IsNotEmpty,
  IsString,
  IsInt,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({
    description: 'A brief description of the project purpose',
    example: 'Project focused on Q1 social media growth',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The ID of the team this project belongs to',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  teamId!: number;
}
