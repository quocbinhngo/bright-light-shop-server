import config from "config";
import mongoose, { Document, Schema } from "mongoose";

export interface ItemInput {
  itemCode: number;
  publishedYear: number;
  title: string;
  rentalType: "dvd" | "record" | "game";
  copiesNumber: number;
  rentalFee: number;
  genre?: string;
  imageUrl: string;
}

export interface ItemDocument extends ItemInput, Document {
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema(
  {
    itemCode: {
      type: String,
      required: true,
    },
    publishedYear: { type: Number, required: true },
    title: { type: String, required: true },
    copiesNumber: { type: Number, required: true },
    rentalType: {
      type: String,
      enum: ["dvd", "record", "game"],
      required: true,
    },
    rentalFee: { type: Number, required: true },
    genre: { type: String },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

const ItemModel = mongoose.model<ItemDocument>("item", itemSchema);

export default ItemModel;
