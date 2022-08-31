import { TypeOf, z } from "zod";

export const createOrderValidation = z.object({
  body: z.object({
    orderDetails: z
      .object({
        itemId: z.string({ required_error: "Item is required" }),
        quantity: z.number({ required_error: "Quantity is required" }),
      })
      .array()
      .nonempty(),
    rentalDuration: z.number({ required_error: "Rental duration is required" }),
  }),
});

export const returnOrderValidation = z.object({
  params: z.object({
    orderId: z.string({ required_error: "Order id is required" }),
  }),
});

export type CreateOrderPayload = TypeOf<typeof createOrderValidation>;
export type ReturnOrderPayload = TypeOf<typeof returnOrderValidation>;
