import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      sub: number;
      email: string;
      role: Role;
    }
  }
}
