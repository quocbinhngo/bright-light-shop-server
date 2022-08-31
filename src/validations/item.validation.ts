import { TypeOf, z } from "zod";

const body = {
  body: z.object({
    publishedYear: z.number({ required_error: "Published year is required" }),
    title: z.string({ required_error: "Title is required" }),
    rentalType: z.enum(["dvd", "record", "game"], {
      required_error: "Rental type is required",
    }),
    copiesNumber: z.number({ required_error: "Copies number is required" }),
    rentalFee: z.number({ required_error: "Rental fee is required" }),
    genre: z.string().optional(),
    imageUrl: z.string().optional(),
  }),
};

const params = {
  params: z.object({
    itemId: z.string({ required_error: "Item id is required" }),
  }),
};

export const createItemValidation = z.object({ ...body });
export const getItemByIdValidation = z.object({ ...params });
export const updateItemValidation = z.object({ ...body, ...params });

export const addItemQuantityValidation = z.object({
  ...params,
  body: z.object({
    quantity: z.number({ required_error: "Quantity is required" }),
  }),
});

export type CreateItemPayload = TypeOf<typeof createItemValidation>;
export type GetItemByIdPayload = TypeOf<typeof getItemByIdValidation>;
export type UpdateItemPayload = TypeOf<typeof updateItemValidation>;
export type AddItemQuantityPayload = TypeOf<typeof addItemQuantityValidation>;
