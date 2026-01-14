import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  readonly extendedClient = this.$extends({
    query: {
      $allModels: {
        async findMany({ model, operation, args, query }) {
          if (args.where) {
            args.where = { ...args.where, deletedAt: null };
          } else {
            args.where = { deletedAt: null };
          }
          return query(args);
        },
        async findFirst({ model, operation, args, query }) {
          if (args.where) {
            args.where = { ...args.where, deletedAt: null };
          } else {
            args.where = { deletedAt: null };
          }
          return query(args);
        },
        async findUnique({ model, operation, args, query }) {
          return (this as any).findFirst(args);
        },
      },
    },
    model: {
      $allModels: {
        async softDelete(id: number) {
          return (this as any).update({
            where: { id },
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });
}
