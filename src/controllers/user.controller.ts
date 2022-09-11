import { NextFunction, Request, Response } from "express";
import { get, omit } from "lodash";

import { UserDocument } from "../models/user.model";
import {
  createUser,
  findUser,
  findUsers,
  getMaxCustomerCode,
  getUserFullName,
  getUserIdentifier,
  getUserResponse,
  hashPassword,
  updateUser,
} from "../services/user.service";
import paginatorUtil from "../utils/paginator.util";
import sorterUtil from "../utils/sorter.util";
import {
  AddBalancePayload,
  CreateAccountPayload,
  UpdateUserPayload,
} from "../validations/user.validation";

export async function getUserHandler(req: Request, res: Response) {
  try {
    const user = res.locals.user as UserDocument;
    return res.status(200).json(user);
  } catch (error: any) {}
}

export async function updateUserHandler(
  req: Request<{}, {}, UpdateUserPayload["body"]>,
  res: Response
) {
  try {
    const user = res.locals.user as UserDocument;

    const { firstName, lastName, phone, address } = req.body;
    const updatedUser = (await updateUser(
      { _id: user._id },
      { firstName, lastName, phone, address }
    )) as UserDocument;

    return res.status(200).json(getUserResponse(updatedUser));
  } catch (error: any) {
    return res.status(500).json("Cannot update user");
  }
}

export async function createCustomerAccountHandler(
  req: Request<{}, {}, CreateAccountPayload["body"], {}>,
  res: Response
) {
  try {
    const { firstName, lastName, address, phone, username, password } =
      req.body;

    if (await findUser({ username })) {
      return res.status(400).json("Username is already exists");
    }

    const hashedPassword = await hashPassword(password);
    const customerCode = ((await getMaxCustomerCode()) || 0) + 1;

    const user = await createUser({
      customerCode,
      firstName,
      lastName,
      address,
      phone,
      username,
      password: hashedPassword,
      accountType: "guest",
    });

    const userResponse = getUserResponse(user);

    return res.status(201).json(userResponse);
  } catch (error: any) {
    return res.status(500).json("Cannot create customer account");
  }
}

export async function getCustomershandler(req: Request, res: Response) {
  const { accountType, desc } = req.query;
  const page = req.query.page ? +req.query.page : 1;
  const sortBy = req.query.sortBy as string;
  const sort = { [sortBy]: desc ? -1 : 1 };

  let customers;
  if (!accountType) {
    customers = await findUsers({ accountType: { $ne: "admin" } }, { sort });
  } else {
    customers = await findUsers({ accountType }, { sort });
  }

  let customersResponse = await Promise.all(
    customers.map(async (customer) => getUserResponse(customer))
  );

  if (sortBy === "_id") { 
    customersResponse = sorterUtil.sortByIdentifier(
      customersResponse,
      desc ? -1 : 1
    );
  }

  return res.status(200).json(paginatorUtil.paginate(customersResponse, page));
}

export async function searchCustomersHandler(req: Request, res: Response) {
  const page = req.query.page ? +req.query.page : 1;
  const search = (req.query.search as string).toLowerCase();
  const allCustomers = await findUsers({ accountType: { $ne: "admin" } });

  if (search === "") {
    const customersResponse = await Promise.all(
      allCustomers.map(async (customer) => getUserResponse(customer))
    );

    return res
      .status(200)
      .json(paginatorUtil.paginate(customersResponse, page));
  }

  const customers = allCustomers.filter(
    (customer) =>
      getUserFullName(customer) === search ||
      getUserIdentifier(customer) === search
  );

  const customersResponse = await Promise.all(
    customers.map(async (customer) => getUserResponse(customer))
  );

  return res.status(200).json(paginatorUtil.paginate(customersResponse, page));
}

export async function getCustomerByIdHandler(req: Request, res: Response) {
  const { id } = req.params;
  const customer = await findUser({ _id: id });

  if (!customer || customer.accountType === "admin") {
    return res.status(400).json("Customer does not exist");
  }

  return res.status(200).json(customer);
}

export async function createAdminAccountHandler(
  req: Request<{}, {}, CreateAccountPayload["body"], {}>,
  res: Response
) {
  try {
    const { firstName, lastName, address, phone, username, password } =
      req.body;

    if (await findUser({ username })) {
      return res.status(400).json("Username is already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await createUser({
      firstName,
      lastName,
      address,
      phone,
      username,
      password: hashedPassword,
      accountType: "admin",
    });

    const userResponse = getUserResponse(user);

    return res.status(201).json(userResponse);
  } catch (error: any) {
    return res.status(500).json("Cannot create admin account");
  }
}

export async function addBalanceHandler(
  req: Request<{}, {}, AddBalancePayload["body"]>,
  res: Response
) {
  const { amount } = req.body;
  const userId = get(req, "headers.user-id");

  const balance = ((await findUser({ _id: userId })) as UserDocument).balance;

  const user = await updateUser({ _id: userId }, { balance: balance + amount });

  const userResponse = getUserResponse(user as UserDocument);

  return res.status(200).json(userResponse);
}
