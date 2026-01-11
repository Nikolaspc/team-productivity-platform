// src/auth/entities/user.entity.ts
import { Exclude } from 'class-transformer';
import { Role } from '@prisma/client';

export class UserEntity {
  id: number;
  email: string;
  name: string | null;
  role: Role;

  @Exclude() // Security: Password will never be included in JSON responses
  password: string;

  createdAt: Date;
  updatedAt: Date;

  @Exclude() // Optional: Hide deletedAt from public API
  deletedAt: Date | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
