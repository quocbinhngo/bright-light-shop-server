"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBalanceValidation = exports.updateUserValidation = exports.createAccountValidation = void 0;
const zod_1 = require("zod");
exports.createAccountValidation = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string({ required_error: "First name is required" }),
        lastName: zod_1.z.string({ required_error: "Last name is required" }),
        address: zod_1.z.string({ required_error: "Address is required" }),
        phone: zod_1.z
            .string({ required_error: "Phone is required" })
            .min(10, "Phone must have 10 characters")
            .max(10, "Phone must have 10 characters"),
        username: zod_1.z.string({ required_error: "Username is required" }),
        password: zod_1.z.string({ required_error: "Password is required" }),
    }),
});
exports.updateUserValidation = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string({ required_error: "First name is required" }),
        lastName: zod_1.z.string({ required_error: "Last name is required" }),
        address: zod_1.z.string({ required_error: "Address is required" }),
        phone: zod_1.z
            .string({ required_error: "Phone is required" })
            .min(10, "Phone must have 10 characters")
            .max(10, "Phone must have 10 characters"),
    }),
});
exports.addBalanceValidation = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number({ required_error: "Amount is required" }),
    }),
});
