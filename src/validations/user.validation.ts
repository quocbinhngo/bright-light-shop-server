import { TypeOf, z } from "zod";

export const createAccountValidation = z.object({
  body: z.object({
    firstName: z.string({ required_error: "First name is required" }),
    lastName: z.string({ required_error: "Last name is required" }),
    address: z.string({ required_error: "Address is required" }),
    phone: z
      .string({ required_error: "Phone is required" })
      .min(10, "Phone must have 10 characters")
      .max(10, "Phone must have 10 characters"),
    username: z.string({ required_error: "Username is required" }),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export const updateUserValidation = z.object({
  body: z.object({
    firstName: z.string({ required_error: "First name is required" }),
    lastName: z.string({ required_error: "Last name is required" }),
    address: z.string({ required_error: "Address is required" }),
    phone: z
      .string({ required_error: "Phone is required" })
      .min(10, "Phone must have 10 characters")
      .max(10, "Phone must have 10 characters"),
  }),
});

export const addBalanceValidation = z.object({
  body: z.object({
    amount: z.number({ required_error: "Amount is required" }),
  }),
});

export type CreateAccountPayload = TypeOf<typeof createAccountValidation>;
export type UpdateUserPayload = TypeOf<typeof updateUserValidation>;
export type AddBalancePayload = TypeOf<typeof addBalanceValidation>;
