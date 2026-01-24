"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    extended = this.$extends({
        query: {
            $allModels: {
                async findMany({ args, query }) {
                    args.where = {
                        ...(args.where || {}),
                        deletedAt: null,
                    };
                    return query(args);
                },
                async findFirst({ args, query }) {
                    args.where = {
                        ...(args.where || {}),
                        deletedAt: null,
                    };
                    return query(args);
                },
                async findUnique({ args, query }) {
                    args.where = {
                        ...(args.where || {}),
                        deletedAt: null,
                    };
                    return query(args);
                },
                async count({ args, query }) {
                    args.where = {
                        ...(args.where || {}),
                        deletedAt: null,
                    };
                    return query(args);
                },
            },
        },
        model: {
            $allModels: {
                async softDelete(id) {
                    const context = client_1.Prisma.getExtensionContext(this);
                    return context.update({
                        where: { id },
                        data: { deletedAt: new Date() },
                    });
                },
                async restore(id) {
                    const context = client_1.Prisma.getExtensionContext(this);
                    return context.update({
                        where: { id },
                        data: { deletedAt: null },
                    });
                },
                async countDeleted() {
                    const context = client_1.Prisma.getExtensionContext(this);
                    return context.count({
                        where: { deletedAt: { not: null } },
                    });
                },
            },
        },
    });
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Database connection established successfully');
        }
        catch (error) {
            this.logger.error('Database connection failed', error);
            process.exit(1);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map