import mongoose, { Document, Schema } from "mongoose";

export interface UserInput {
  customerCode?: number; // Only customer
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  username: string;
  password: string;
  accountType: "admin" | "guest" | "regular" | "vip";
}

export interface UserDocument extends UserInput, Document {
  balance: number; // Only customer
  createdAt: Date;
  updatedAt: Date;
  rewardPoint: number;
}

const userSchema = new Schema(
  {
    customerCode: { 
      type: Number,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: { type: String, required: true },
    address: {
      type: String,
      required: true,
    },
    phone: { type: String, required: true },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    accountType: {
      type: String,
      enum: ["admin", "guest", "regular", "vip"],
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    rewardPoint: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<UserDocument>("user", userSchema);

export default UserModel;
