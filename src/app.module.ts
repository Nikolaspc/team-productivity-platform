// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { TeamsModule } from './teams/teams.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { StorageModule } from './storage/storage.module.js'; // English: Added for Cloud Storage
import { AtGuard } from './auth/guards/at.guard.js';

@Module({
  imports: [
    // English: Global configuration for environment variables (.env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // English: Core and Feature Modules
    PrismaModule,
    AuthModule,
    TeamsModule,
    ProjectsModule,
    TasksModule,
    DashboardModule,
    NotificationsModule,
    StorageModule, // English: Essential to make StorageService available
  ],
  providers: [
    // English: Registering AtGuard as a global guard using APP_GUARD token.
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
