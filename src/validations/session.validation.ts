import { TypeOf, z } from "zod";

const createSessionValidation = z.object({
  body: z.object({
    username: z.string({ required_error: "Username is required" }),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export type CreateSessionPayload = TypeOf<typeof createSessionValidation>;
