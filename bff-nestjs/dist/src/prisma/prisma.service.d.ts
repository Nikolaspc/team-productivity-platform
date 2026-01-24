import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    readonly extended: import("@prisma/client/runtime/library").DynamicClientExtensionThis<Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
        result: {};
        model: {
            $allModels: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            user: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            team: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            project: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            teamMember: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            task: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            attachment: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            invitation: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
        };
        query: {};
        client: {};
    }, Prisma.PrismaClientOptions>, Prisma.TypeMapCb, {
        result: {};
        model: {
            $allModels: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            user: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            team: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            project: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            teamMember: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            task: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            attachment: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
            invitation: {
                softDelete: () => <T, A>(this: T, id: number) => Promise<any>;
                restore: () => <T, A>(this: T, id: number) => Promise<any>;
                countDeleted: () => <T, A>(this: T) => Promise<any>;
            };
        };
        query: {};
        client: {};
    }, {}>;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
