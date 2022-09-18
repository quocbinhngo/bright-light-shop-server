"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addItemQuantityValidation = exports.updateItemValidation = exports.getItemByIdValidation = exports.createItemValidation = void 0;
const zod_1 = require("zod");
const body = {
    body: zod_1.z.object({
        publishedYear: zod_1.z.number({ required_error: "Published year is required" }),
        title: zod_1.z.string({ required_error: "Title is required" }),
        rentalType: zod_1.z.enum(["dvd", "record", "game"], {
            required_error: "Rental type is required",
        }),
        copiesNumber: zod_1.z.number({ required_error: "Copies number is required" }),
        rentalFee: zod_1.z.number({ required_error: "Rental fee is required" }),
        genre: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().optional(),
    }),
};
const params = {
    params: zod_1.z.object({
        itemId: zod_1.z.string({ required_error: "Item id is required" }),
    }),
};
exports.createItemValidation = zod_1.z.object(Object.assign({}, body));
exports.getItemByIdValidation = zod_1.z.object(Object.assign({}, params));
exports.updateItemValidation = zod_1.z.object(Object.assign(Object.assign({}, body), params));
exports.addItemQuantityValidation = zod_1.z.object(Object.assign(Object.assign({}, params), { body: zod_1.z.object({
        quantity: zod_1.z.number({ required_error: "Quantity is required" }),
    }) }));
