// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Infrastructure & Base Modules
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StorageModule } from './storage/storage.module';

// Business Logic Modules
import { TeamsModule } from './teams/teams.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';

// Security & Config
import { AtGuard } from './auth/guards/at.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    AuthModule,
    NotificationsModule,
    StorageModule,
    TeamsModule,
    ProjectsModule,
    TasksModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard, // English: Checks JWT (ignores @Public routes)
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // English: Checks Roles (Admin/User)
    },
  ],
})
export class AppModule {}
