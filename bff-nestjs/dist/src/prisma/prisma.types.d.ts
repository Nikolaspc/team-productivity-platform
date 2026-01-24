export type SoftDeleteModel = 'user' | 'team' | 'project' | 'task' | 'attachment';
export interface SoftDeleteWhereInput {
    deletedAt?: {
        equals?: null;
        not?: null;
        isSet?: boolean;
    };
}
export interface SoftDeleteOptions {
    hardDelete?: boolean;
    includeSoftDeleted?: boolean;
}
export declare function withoutDeleted<T extends Record<string, any>>(where?: T): T & {
    deletedAt: null;
};
export declare function onlyDeleted<T extends Record<string, any>>(where?: T): T & {
    deletedAt: {
        not: null;
    };
};
export declare function softDeleteData(data: any, options?: SoftDeleteOptions): any;
