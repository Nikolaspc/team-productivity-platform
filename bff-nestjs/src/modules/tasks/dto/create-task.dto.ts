import { IsNotEmpty, IsString, IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implement Login UI',
    description: 'The title of the task',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    example: 'Create the frontend form for user authentication',
    description: 'Detailed description of the task',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.TODO,
    description: 'The current status of the task',
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus = TaskStatus.TODO;

  @ApiProperty({
    example: 1,
    description: 'The ID of the project this task belongs to',
  })
  @IsInt()
  @IsNotEmpty()
  projectId!: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'The ID of the user assigned to this task',
  })
  @IsInt()
  @IsOptional()
  assigneeId?: number;

  @ApiPropertyOptional({
    example: '2026-02-01T00:00:00.000Z',
    description: 'Due date for the task in ISO 8601 format',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
