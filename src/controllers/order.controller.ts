import { Request, Response } from "express";
import { get } from "lodash";

import { UserDocument } from "../models/user.model";
import {
  checkDuplicateItem,
  createOrder,
  findOrder,
  findOrders,
  getOrderDetailsWithItem,
  getOrderResponse,
  processOrder,
  returnOrder,
  saveRewardPoint,
} from "../services/order.service";
import { findUser } from "../services/user.service";
import paginatorUtil from "../utils/paginator.util";
import {
  CreateOrderPayload,
  ReturnOrderPayload,
} from "../validations/order.validation";

export async function createOrderHandler(
  req: Request<{}, {}, CreateOrderPayload["body"]>,
  res: Response
) {
  const customerId = get(req, "headers.user-id");
  const { orderDetails, rentalDuration } = req.body;

  const customer = await findUser({ _id: customerId });

  if (!customer || customer.accountType === "admin") {
    return res.status(403).json("You are not authenticated");
  }

  // Check whether the guest make 2 day ren
  if (customer.accountType === "guest" && rentalDuration === 2) {
    return res.status(403).json("Guest account cannot make 2-day rental");
  }

  const totalQuantity = orderDetails.reduce(
    (value, orderDetail) => value + orderDetail["quantity"],
    0
  );

  if (customer.accountType === "guest" && totalQuantity > 2) {
    return res.status(403).json("Guest account cannot rent more than 2 items");
  }

  // Check whether duplicate item
  if (checkDuplicateItem(orderDetails)) {
    return res.status(400).json("You make a duplicate item selection");
  }

  // Check whether the item is available or not
  const orderDetailsWithItem = await getOrderDetailsWithItem(orderDetails);
  if (!orderDetailsWithItem) {
    return res.status(400).json("Item is not available");
  }

  if (typeof orderDetailsWithItem === "string") {
    return res.status(400).json(orderDetailsWithItem);
  }

  if (!(await processOrder(orderDetailsWithItem, customer))) {
    return res
      .status(400)
      .json("Your balance is not enough for creating order");
  }

  await createOrder({ orderDetails, rentalDuration, customerId });

  const newRewardPoint = await saveRewardPoint(customerId, orderDetails);

  if (!newRewardPoint) {
    return res.status(201).json("Create order successfully");
  }

  return res
    .status(201)
    .json(
      `Create order successfully. Your current reward points now is ${newRewardPoint}`
    );
}

export async function createOrderWithRewardPointHandler(
  req: Request<{}, {}, CreateOrderPayload["body"]>,
  res: Response
) {
  const customerId = get(req, "headers.user-id");
  const { orderDetails, rentalDuration } = req.body;

  const customer = await findUser({ _id: customerId });

  if (!customer || customer.accountType !== "vip") {
    return res.status(403).json("You are not authenticated");
  }

  // Check whether the item is available or not
  const orderDetailsWithItem = await getOrderDetailsWithItem(orderDetails);
  if (!orderDetailsWithItem) {
    return res.status(400).json("Item is not available");
  }

  if (typeof orderDetailsWithItem === "string") {
    return res.status(400).json(orderDetailsWithItem);
  }

  if (!(await processOrder(orderDetailsWithItem, customer, true))) {
    return res
      .status(400)
      .json("Your reward point is not enough for creating order");
  }

  await createOrder({ orderDetails, rentalDuration, customerId });

  const rewardPoint = ((await findUser({ _id: customerId })) as UserDocument)
    .rewardPoint;

  return res
    .status(201)
    .json(
      `Create order successfully. Your current reward points now is ${rewardPoint}`
    );
}

export async function getAllOrdersHandler(req: Request, res: Response) {
  const page = req.query.page ? +req.query.page : 1;
  const user = res.locals.user as UserDocument;
  const orders = await findOrders({ customerId: user._id });
  const ordersResponse = await Promise.all(
    orders.map(async (order) => await getOrderResponse(order))
  );

  console.log(paginatorUtil.paginate(ordersResponse, page, 5));

  return res.status(200).json(paginatorUtil.paginate(ordersResponse, page, 5));
}

export async function returnOrderHandler(
  req: Request<ReturnOrderPayload["params"]>,
  res: Response
) {
  const { orderId } = req.params;
  const userId = get(req, "headers.user-id");

  const order = await findOrder({ _id: orderId, customerId: userId });

  if (!order) {
    return res.status(400).json("You do not have this order");
  }

  const isOntime = await returnOrder(orderId, userId);

  if (!isOntime) {
    const balance = ((await findUser({ _id: userId })) as UserDocument).balance;

    return res
      .status(200)
      .json(
        `Return order late. You are fine with $10. Now your balance is ${balance}`
      );
  }

  return res.status(200).json("Return order on time. Thank you for renting");
}
