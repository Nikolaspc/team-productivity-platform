"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withoutDeleted = withoutDeleted;
exports.onlyDeleted = onlyDeleted;
exports.softDeleteData = softDeleteData;
function withoutDeleted(where) {
    return {
        ...(where || {}),
        deletedAt: null,
    };
}
function onlyDeleted(where) {
    return {
        ...(where || {}),
        deletedAt: { not: null },
    };
}
function softDeleteData(data, options) {
    if (!options?.hardDelete && data.deletedAt !== undefined) {
        delete data.deletedAt;
    }
    return data;
}
//# sourceMappingURL=prisma.types.js.map