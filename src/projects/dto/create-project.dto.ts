import { IsNotEmpty, IsString, IsInt, MinLength } from 'class-validator';
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
  name: string;

  @ApiProperty({
    description: 'The ID of the team this project belongs to',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  teamId: number;
}
