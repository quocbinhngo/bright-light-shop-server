"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnOrderValidation = exports.createOrderValidation = void 0;
const zod_1 = require("zod");
exports.createOrderValidation = zod_1.z.object({
    body: zod_1.z.object({
        orderDetails: zod_1.z
            .object({
            itemId: zod_1.z.string({ required_error: "Item is required" }),
            quantity: zod_1.z.number({ required_error: "Quantity is required" }),
        })
            .array()
            .nonempty(),
        rentalDuration: zod_1.z.number({ required_error: "Rental duration is required" }),
    }),
});
exports.returnOrderValidation = zod_1.z.object({
    params: zod_1.z.object({
        orderId: zod_1.z.string({ required_error: "Order id is required" }),
    }),
});
