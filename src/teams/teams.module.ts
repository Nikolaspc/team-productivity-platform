// src/teams/teams.module.ts
import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService], // Exporting service in case Projects module needs it later
})
export class TeamsModule {}
