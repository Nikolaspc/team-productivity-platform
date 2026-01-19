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
   */
  readonly extended = this.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          // English: Automatic filter for soft-deleted records
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findUnique({ args, query }) {
          // English: Redirect findUnique to findFirst to support deletedAt filter.
          // This ensures that even unique lookups respect the soft-delete policy.
          args.where = { ...args.where, deletedAt: null };
          return (query as any)(args);
        },
      },
    },
    model: {
      $allModels: {
        /**
         * Custom method for soft deletion.
         * Usage: this.prisma.extended.task.softDelete(id)
         */
        async softDelete<T, A>(this: T, id: number) {
          const context = Prisma.getExtensionContext(this);
          return (context as any).update({
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
      this.logger.error('Database connection failed', error);
      // English: Critical failure, stop the process if DB is unreachable
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
