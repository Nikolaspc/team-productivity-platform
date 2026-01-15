import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// --- Infrastructure & Base Modules ---
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StorageModule } from './storage/storage.module';

// --- Business Logic Modules (Features) ---
import { TeamsModule } from './teams/teams.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';

// --- Security & Config ---
import { AtGuard } from './auth/guards/at.guard';
import { RolesGuard } from './common/guards/roles.guard';
// English: Fixed path to match our professional structure in src/common/config
import { envValidationSchema } from './common/config/env.validation';

@Module({
  imports: [
    // English: Global configuration with strict Joi validation schema
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      cache: true, // English: Improved performance for config lookups
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
    // English: Global Authentication Guard (JWT) - Protects all routes by default
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    // English: Global Authorization Guard (RBAC) - Evaluates @Roles() decorator
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
