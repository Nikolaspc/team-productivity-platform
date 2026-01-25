// bff-nestjs/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TerminusModule } from '@nestjs/terminus';

// English: Using @/ alias for clean enterprise-level imports
import { AuthModule } from '@/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { StorageModule } from '@/storage/storage.module';

import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { TeamsModule } from '@/modules/teams/teams.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { DashboardModule } from '@/modules/dashboard/dashboard.module';
import { InvitationsModule } from '@/modules/invitations/invitations.module';
import { MailModule } from '@/modules/mail/mail.module';
import { HealthModule } from '@/modules/health/health.module';

import { AtGuard } from '@/auth/guards/at.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
// English: Unified validation schema location
import { envValidationSchema } from '@/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      cache: true,
    }),

    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL') || 'info',
          transport:
            config.get('NODE_ENV') !== 'production'
              ? { target: 'pino-pretty', options: { colorize: true } }
              : undefined,
        },
      }),
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL') || 60000,
          limit: config.get('THROTTLE_LIMIT') || 20,
        },
      ],
    }),

    PrometheusModule.register({ path: '/metrics' }),
    TerminusModule,
    PrismaModule,
    AuthModule,
    StorageModule,
    MailModule,
    HealthModule,
    NotificationsModule,
    TeamsModule,
    ProjectsModule,
    TasksModule,
    DashboardModule,
    InvitationsModule,
  ],
  providers: [
    // English: Global guards execution order is preserved: Rate Limit -> Auth -> RBAC
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AtGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
