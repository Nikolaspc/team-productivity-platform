import { Role } from '@prisma/client';
export declare class User {
    id: number;
    email: string;
    name: string | null;
    role: Role;
    password: string;
    refreshTokenHash?: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
