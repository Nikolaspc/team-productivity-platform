"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const nestjs_pino_1 = require("nestjs-pino");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const terminus_1 = require("@nestjs/terminus");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const storage_module_1 = require("./storage/storage.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const teams_module_1 = require("./modules/teams/teams.module");
const projects_module_1 = require("./modules/projects/projects.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const invitations_module_1 = require("./modules/invitations/invitations.module");
const mail_module_1 = require("./modules/mail/mail.module");
const health_module_1 = require("./modules/health/health.module");
const at_guard_1 = require("./auth/guards/at.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const env_validation_1 = require("./common/config/env.validation");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: env_validation_1.envValidationSchema,
                cache: true,
            }),
            nestjs_pino_1.LoggerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    pinoHttp: {
                        level: config.get('NODE_ENV') !== 'production' ? 'debug' : 'info',
                        transport: config.get('NODE_ENV') !== 'production'
                            ? { target: 'pino-pretty', options: { colorize: true } }
                            : undefined,
                    },
                }),
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: config.get('THROTTLE_TTL') || 60000,
                        limit: config.get('THROTTLE_LIMIT') || 10,
                    },
                ],
            }),
            nestjs_prometheus_1.PrometheusModule.register({ path: '/metrics' }),
            terminus_1.TerminusModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            storage_module_1.StorageModule,
            mail_module_1.MailModule,
            health_module_1.HealthModule,
            notifications_module_1.NotificationsModule,
            teams_module_1.TeamsModule,
            projects_module_1.ProjectsModule,
            tasks_module_1.TasksModule,
            dashboard_module_1.DashboardModule,
            invitations_module_1.InvitationsModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: at_guard_1.AtGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map