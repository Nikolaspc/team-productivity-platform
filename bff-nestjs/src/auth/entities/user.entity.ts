import { Role } from '@prisma/client';

export class User {
  id!: number;
  email!: string;
  name!: string | null;
  role!: Role;
  password!: string;
  refreshTokenHash?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
