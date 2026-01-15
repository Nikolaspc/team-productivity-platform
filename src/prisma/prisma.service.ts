import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  // Enterprise Standard: Define the extended client as a property
  // We use this to expose the soft-delete functionality globally
  readonly extended = this.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          // English: Automatically filter out soft-deleted records
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findUnique({ args, query }) {
          // English: Prisma findUnique is strict. We redirect it to findFirst
          // to allow the deletedAt filter safely.
          args.where = { ...args.where, deletedAt: null };
          return (this as any).findFirst(args);
        },
      },
    },
    model: {
      $allModels: {
        /**
         * Custom method to perform a soft delete instead of a permanent one.
         * Useful for GDPR compliance and data recovery.
         */
        async softDelete<T>(this: T, id: number) {
          return (this as any).update({
            where: { id },
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to the database', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
