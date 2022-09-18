"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    sortByIdentifier(arr, desc) {
        return arr.sort((a, b) => desc * (a["identifier"].localeCompare(b["identifier"])));
    },
};
