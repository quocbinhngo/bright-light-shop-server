"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    paginate(arr, page, size = 5) {
        return arr.slice(size * (page - 1), size * page);
    },
};
