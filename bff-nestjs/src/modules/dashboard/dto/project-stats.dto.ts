import { ApiProperty } from '@nestjs/swagger';

export class ProjectStatsDto {
  @ApiProperty()
  projectId!: number;

  @ApiProperty()
  projectName!: string;

  @ApiProperty()
  totalTasks!: number;

  @ApiProperty()
  completedTasks!: number;

  @ApiProperty()
  pendingTasks!: number;

  @ApiProperty()
  overdueTasks!: number;

  @ApiProperty()
  progress!: number;
}
