/**
 * Prisma Type Utilities and Configurations
 * English: This file provides type-safe utilities for working with Prisma extensions
 * and soft-delete operations in a production SaaS environment.
 */

import { Prisma } from '@prisma/client';

/**
 * Represents models that support soft delete functionality.
 * Update this union type when adding deletedAt field to new models.
 */
export type SoftDeleteModel = 'user' | 'team' | 'project' | 'task' | 'attachment';

/**
 * Type for Prisma where clauses that include soft-delete filtering.
 * This ensures type safety when building where clauses manually.
 */
export interface SoftDeleteWhereInput {
  deletedAt?: {
    equals?: null;
    not?: null;
    isSet?: boolean;
  };
}

/**
 * Options for soft-delete operations.
 * Useful for controlling behavior in different contexts.
 */
export interface SoftDeleteOptions {
  /**
   * If true, permanently deletes the record instead of soft-deleting.
   * Use with caution in production!
   */
  hardDelete?: boolean;

  /**
   * If true, includes soft-deleted records in the response.
   * Useful for admin/audit operations.
   */
  includeSoftDeleted?: boolean;
}

/**
 * English: Helper function to build a where clause that excludes soft-deleted records.
 * Usage: const activeUsers = await prisma.user.findMany({
 *   where: withoutDeleted({ role: 'ADMIN' })
 * })
 */
export function withoutDeleted<T extends Record<string, any>>(where?: T): T & { deletedAt: null } {
  return {
    ...(where || {}),
    deletedAt: null,
  } as T & { deletedAt: null };
}

/**
 * English: Helper function to build a where clause that includes only soft-deleted records.
 * Useful for recovery and audit operations.
 * Usage: const deletedTasks = await prisma.task.findMany({
 *   where: onlyDeleted({ projectId: 1 })
 * })
 */
export function onlyDeleted<T extends Record<string, any>>(
  where?: T,
): T & { deletedAt: { not: null } } {
  return {
    ...(where || {}),
    deletedAt: { not: null },
  } as T & { deletedAt: { not: null } };
}

/**
 * English: Type-safe wrapper for update operations with soft-delete support.
 * This prevents accidental direct updates to the deletedAt field.
 */
export function softDeleteData(data: any, options?: SoftDeleteOptions): any {
  // English: Prevent accidental overwrites of deletedAt in normal operations
  if (!options?.hardDelete && data.deletedAt !== undefined) {
    delete data.deletedAt;
  }
  return data;
}
