import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';

// --- Infrastructure & Base Modules ---
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';

// --- Business Logic Modules (Ubicados en src/modules/) ---
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TeamsModule } from './modules/teams/teams.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { InvitationsModule } from './modules/invitations/invitations.module'; // Nuevo

// --- Security & Config ---
import { AtGuard } from './auth/guards/at.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { envValidationSchema } from './common/config/env.validation';

@Module({
  imports: [
    // English: Global configuration and Environment variables validation
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      cache: true,
    }),

    // English: Global Redis connection for all BullMQ queues
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST') || 'localhost',
          port: config.get('REDIS_PORT') || 6379,
        },
      }),
    }),

    // --- Core Infrastructure ---
    PrismaModule,
    AuthModule,
    StorageModule,

    // --- Feature Modules (Domain Logic) ---
    NotificationsModule,
    TeamsModule,
    ProjectsModule,
    TasksModule,
    DashboardModule,
    InvitationsModule, // Registrado para habilitar envío de correos y tokens
  ],
  providers: [
    // English: Global Guard to protect all endpoints with JWT by default
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    // English: Global Guard to handle Role-Based Access Control (RBAC)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
