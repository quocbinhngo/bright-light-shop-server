import bcrypt from "bcrypt";
import config from "config";
import { omit } from "lodash";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";

import UserModel, { UserDocument, UserInput } from "../models/user.model";
import { getItemNumber } from "./order.service";

const PER_PAGE = 10;
export interface ValidateUsernameAndPasswordPayload {
  username: string;
  password: string;
}

export async function createUser(input: UserInput) {
  return await UserModel.create(input);
}

export async function findUsers(
  query: FilterQuery<UserDocument>,
  options: QueryOptions = {}
) {
  return await UserModel.find(query, null, options);
}

export async function findUser(
  query: FilterQuery<UserDocument>,
  options: QueryOptions = {}
) {
  return await UserModel.findOne(query, options);
}

export async function updateUser(
  query: FilterQuery<UserDocument>,
  update: UpdateQuery<UserDocument>,
  options: QueryOptions = { new: true }
) {
  return await UserModel.findOneAndUpdate(query, update, options);
}

export async function getMaxCustomerCode() {
  const customers = await UserModel.find({ accountType: { $ne: "admin" } })
    .sort({ customerCode: -1 })
    .limit(1);

  if (!customers || customers.length === 0) {
    return 0;
  }

  return customers[0].customerCode;
}

export function getUserFullName(user: UserDocument) {
  return (user.firstName + " " + user.lastName).toLowerCase();
}

export function getUserIdentifier(user: UserDocument) {
  return (
    "C" + ((user.customerCode as number) || 0).toString().padStart(3, "0")
  );
}

export function getUserResponse(user: UserDocument) {
  const identifier = getUserIdentifier(user);
  return { ...omit(user.toJSON(), "password"), identifier };
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function validateUsernameAndPassword({
  username,
  password,
}: ValidateUsernameAndPasswordPayload) {
  const user = await findUser({ username });

  if (!user) {
    return null;
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return null;
  }

  return user;
}

export async function addBalance(customerId: string, amount: number) {
  const customer = await findUser({ _id: customerId });

  if (!customer) {
    return false;
  }

  if (customer.accountType === "admin") {
    return false;
  }

  if (customer.balance + amount < 0) {
    return false;
  }

  updateUser({ _id: customerId }, { balance: customer.balance + amount });
  return true;
}

export async function addRewardPoint(customerId: string, amount: number) {
  const customer = await findUser({ _id: customerId });

  if (!customer || customer.accountType !== "vip") {
    return false;
  }

  await updateUser(
    { _id: customerId },
    { rewardPoint: customer.rewardPoint + amount }
  );

  return true;
}

export async function promoteCustomer(customerId: string) {
  const customer = await findUser({ _id: customerId });

  if (!customer || customer.accountType === "admin") {
    return;
  }

  const itemNumber = await getItemNumber(customerId);

  if (itemNumber >= 8) {
    await updateUser({ _id: customerId }, { accountType: "vip" });
    return;
  }

  if (itemNumber >= 3) {
    await updateUser({ _id: customerId }, { accountType: "regular" });
  }
}
