import mongoose, { Document, Schema } from "mongoose";
import { string } from "zod";

export interface ItemImageInput {
  url: string;
  rentalType: "dvd" | "record" | "game";
}

export interface ItemImageDocument extends ItemImageInput, Document {
  createdAt: Date;
  updatedAt: Date;
}

const itemImageSchema = new Schema(
  {
    url: {
      type: String, 
      required: true,
    },
    rentalType: {
      type: String,
      enum: ["dvd", "record", "game"],
    },
  },
  { timestamps: true }
);

const ItemImageModel = mongoose.model<ItemImageDocument>(
  "itemImage",
  itemImageSchema
);

export default ItemImageModel;
