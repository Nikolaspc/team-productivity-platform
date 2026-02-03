import { IsNotEmpty, IsString, MinLength, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Marketing Campaign', minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Project focused on Q1 social media growth' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
