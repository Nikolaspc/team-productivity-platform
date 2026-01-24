"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteExtension = void 0;
const client_1 = require("@prisma/client");
exports.softDeleteExtension = client_1.Prisma.defineExtension({
    name: 'softDelete',
    query: {
        $allModels: {
            async findMany({ model, operation, args, query }) {
                args.where = { ...args.where, deletedAt: null };
                return query(args);
            },
            async findFirst({ model, operation, args, query }) {
                args.where = { ...args.where, deletedAt: null };
                return query(args);
            },
            async findUnique({ model, operation, args, query }) {
                args.where = { ...args.where, deletedAt: null };
                return query(args);
            },
        },
    },
});
//# sourceMappingURL=soft-delete.extension.js.map