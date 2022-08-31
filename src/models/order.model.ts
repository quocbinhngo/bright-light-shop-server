import mongoose, { Document, Schema } from "mongoose";

import { ItemDocument } from "./item.model";

export interface OrderDetail {
  itemId: string;
  quantity: number;
}

export interface OrderDetailWithItem {
  item: ItemDocument;
  quantity: number;
}

export interface OrderInput {
  orderDetails: Array<OrderDetail>;
  customerId: String;
  rentalDuration: number;
}

export interface OrderDocument extends OrderInput, Document {
  returned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema(
  {
    orderDetails: {
      type: Array,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    rentalDuration: {
      type: Number,
      required: true,
    },
    returned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model<OrderDocument>("order", orderSchema);

export default OrderModel;
