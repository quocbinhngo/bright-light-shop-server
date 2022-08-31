import { omit } from "lodash";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";

import OrderModel, { OrderDetail, OrderDetailWithItem, OrderDocument, OrderInput } from "../models/order.model";
import { UserDocument } from "../models/user.model";
import converterUtil from "../utils/converter.util";
import { findItem } from "./item.service";
import { addBalance, addRewardPoint, findUser, promoteCustomer } from "./user.service";

export async function createOrder(input: OrderInput) {
  return await OrderModel.create(input);
}

export async function findOrder(
  query: FilterQuery<OrderDocument>,
  options: QueryOptions = {}
) {
  return await OrderModel.findOne(query, options);
}

export async function findOrders(
  query: FilterQuery<OrderDocument>,
  options: QueryOptions = {}
) {
  return await OrderModel.find(query, options);
}

export async function updateOrder(
  query: FilterQuery<OrderDocument>,
  update: UpdateQuery<OrderDocument>,
  options: QueryOptions = { new: true }
) {
  return await OrderModel.findOneAndUpdate(query, update, options);
}

export function checkDuplicateItem(orderDetails: Array<OrderDetail>) {
  const itemSet = new Set();
  for (const orderDetail of orderDetails) {
    if (!itemSet.has(orderDetail.itemId)) {
      itemSet.add(orderDetail.itemId);
      continue;
    }

    return true;
  }

  return false;
}

export async function getItemAvailableNumber(itemId: string) {
  const item = await findItem({ _id: itemId });

  if (!item) {
    return 0;
  }

  let rentedNumber = 0;

  const rentedOrders = await findOrders({ returned: false });

  for (const order of rentedOrders) {
    for (const orderDetail of order.orderDetails) {
      if (orderDetail.itemId !== itemId) {
        continue;
      }

      rentedNumber += orderDetail.quantity;
    }
  }

  return item.copiesNumber - rentedNumber;
}

export async function getOrderResponse(order: OrderDocument) {
  const orderDetailsWithItem = (await getOrderDetailsWithItem(
    order.orderDetails
  )) as Array<OrderDetailWithItem>;

  const orderDetailsWithItemAndAvailableNumber = await Promise.all(
    orderDetailsWithItem.map(async (orderDetailWithItem) => {
      return {
        item: {
          ...orderDetailWithItem.item.toJSON(),
          availableNumber: await getItemAvailableNumber(
            orderDetailWithItem.item._id
          ),
        },
        quantity: orderDetailWithItem.quantity,
      };
    })
  );

  return {
    ...omit(order.toJSON(), "orderDetails"),
    orderDetails: orderDetailsWithItemAndAvailableNumber,
  };
}

export async function getOrderDetailsWithItem(
  orderDetails: Array<OrderDetail>
) {
  let orderDetailsWithItem = new Array<OrderDetailWithItem>();

  for (const orderDetail of orderDetails) {
    const item = await findItem({ _id: orderDetail.itemId });
    if (!item) {
      return null;
    }

    const availableNumber = await getItemAvailableNumber(item._id);
    if (availableNumber < orderDetail.quantity) {
      return `Item ${item.title} has only ${availableNumber} items`;
    }

    orderDetailsWithItem.push({
      item,
      quantity: orderDetail.quantity,
    });
  }

  return orderDetailsWithItem;
}

export async function processOrder(
  orderDetailsWithItem: Array<OrderDetailWithItem>,
  customer: UserDocument,
  useRewardPoint: Boolean = false
) {
  const totalValue = orderDetailsWithItem.reduce(
    (total, orderDetailWithItem) =>
      total + orderDetailWithItem.item.rentalFee * orderDetailWithItem.quantity,
    0
  );
  const totalQuantity = orderDetailsWithItem.reduce(
    (total, orderDetailWithItem) => total + orderDetailWithItem.quantity,
    0
  );

  const rentedOrders = await findOrders({
    customerId: customer._id,
    returned: false,
  });

  if (useRewardPoint) {
    if (
      customer.rewardPoint <
      totalQuantity * 100
      // ||
      // 10 * (rentedOrders.length + 1) > customer.balance
    ) {
      return false;
    }

    await addRewardPoint(customer._id, -100 * totalQuantity);

    return true;
  }

  // Assume the deny fee for each late returned order is $10
  if (totalValue + 10 * (rentedOrders.length + 1) > customer.balance) {
    return false;
  }

  // Update user balance
  await addBalance(customer._id, -totalValue);

  return true;
}

export async function saveRewardPoint(
  customerId: string,
  orderDetails: Array<OrderDetail>
) {
  const customer = await findUser({ _id: customerId });

  if (!customer || customer.accountType !== "vip") {
    return null;
  }

  const totalQuantity = orderDetails.reduce(
    (sum, orderDetail) => (sum += orderDetail.quantity),
    0
  );

  const newRewardPoint = customer.rewardPoint + totalQuantity * 10;

  await addRewardPoint(customerId, totalQuantity * 10);

  return newRewardPoint;
}

export async function returnOrder(orderId: string, customerId: string) {
  // Find order and user
  const order = await findOrder({ _id: orderId, customerId });
  const customer = await findUser({ _id: customerId });

  if (!order || !customer) {
    return null;
  }

  // Update the returned status of order
  await updateOrder({ _id: orderId }, { returned: true });

  // Promote the customer account type
  await promoteCustomer(customerId);

  if (
    Date.now() >
    converterUtil.dateToNumber(order.createdAt) +
      order.rentalDuration * 24 * 3600 * 1000
  ) {
    await addBalance(customerId, -10);
    return false;
  }

  return true;
}

export async function getItemNumber(customerId: string) {
  const orders = await findOrders({ customerId });
  let ans = 0;

  for (const order of orders) {
    for (const orderDetail of order.orderDetails) {
      ans += orderDetail.quantity;
    }
  }

  return ans;
}
