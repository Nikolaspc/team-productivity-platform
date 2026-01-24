import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
// English: Import both PrismaClient and the Prisma namespace for extensions
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Enterprise Standard: Prisma Client Extension for Soft Delete.
   * This logic ensures that deleted records are hidden by default and
   * provides a professional way to handle data.
   *
   * The extension uses query middleware to automatically filter deleted records
   * in read operations, and model extensions to provide utility methods.
   */
  readonly extended = this.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          // English: Automatic filter for soft-deleted records
          // If where clause doesn't exist, create it
          args.where = {
            ...(args.where || {}),
            deletedAt: null,
          };
          return query(args);
        },

        async findFirst({ args, query }) {
          // English: Same soft-delete filter as findMany
          args.where = {
            ...(args.where || {}),
            deletedAt: null,
          };
          return query(args);
        },

        async findUnique({ args, query }) {
          // English: Redirect findUnique to findFirst to support deletedAt filter.
          // This ensures that even unique lookups respect the soft-delete policy.
          args.where = {
            ...(args.where || {}),
            deletedAt: null,
          };
          // Cast to any because Prisma's type system doesn't fully support this pattern
          return (query as any)(args);
        },

        async count({ args, query }) {
          // English: Include soft-delete filter in count queries
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
        /**
         * Custom method for soft deletion.
         * Usage: await this.prisma.extended.task.softDelete(id)
         * This is a convenience method that performs a soft delete operation.
         */
        async softDelete<T, A>(this: T, id: number) {
          const context = Prisma.getExtensionContext(this);
          return (context as any).update({
            where: { id },
            data: { deletedAt: new Date() },
          });
        },

        /**
         * Custom method for restoring soft-deleted records.
         * Usage: await this.prisma.extended.task.restore(id)
         * This is useful for recovery scenarios in enterprise applications.
         */
        async restore<T, A>(this: T, id: number) {
          const context = Prisma.getExtensionContext(this);
          return (context as any).update({
            where: { id },
            data: { deletedAt: null },
          });
        },

        /**
         * Custom method to count only deleted records.
         * Usage: await this.prisma.extended.task.countDeleted()
         * Useful for audit and compliance reporting.
         */
        async countDeleted<T, A>(this: T) {
          const context = Prisma.getExtensionContext(this);
          return (context as any).count({
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
    } catch (error) {
      this.logger.error('Database connection failed', error);
      // English: Critical failure, stop the process if DB is unreachable
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
