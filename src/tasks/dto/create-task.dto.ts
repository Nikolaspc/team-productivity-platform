// src/tasks/dto/create-task.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement Login UI' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Create the frontend form for user authentication',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @ApiProperty({ example: '2026-02-01T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
