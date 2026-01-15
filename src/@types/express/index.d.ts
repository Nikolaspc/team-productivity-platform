import { Role } from '@prisma/client';

export {}; // English: Necessary to treat this file as a module

declare global {
  namespace Express {
    // English: Extending the Request object to include the validated JWT payload
    interface User {
      sub: number;
      email: string;
      role: Role;
    }
    // English: Ensuring the Request interface recognizes the User property
    interface Request {
      user?: User;
    }
  }
}
