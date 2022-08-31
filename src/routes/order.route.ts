import { Router } from "express";

import {
  createOrderHandler,
  createOrderWithRewardPointHandler,
  getAllOrdersHandler,
  returnOrderHandler,
} from "../controllers/order.controller";
import requireCustomerMiddleware from "../middlewares/require-customer.middleware";
import validatePayloadMiddleware from "../middlewares/validate-payload.middleware";
import OrderModel from "../models/order.model";
import {
  createOrderValidation,
  returnOrderValidation,
} from "../validations/order.validation";

const orderRouter = Router();

orderRouter.post(
  "/",
  requireCustomerMiddleware,
  validatePayloadMiddleware(createOrderValidation),
  createOrderHandler
);

// Customer get all their orders
orderRouter.get("/", requireCustomerMiddleware, getAllOrdersHandler);

// Get specific info of an order
// orderRouter.get("/:orderId", getOrderByIdHandler);

// Admin get all order of a customer
// orderRouter.get("/customers/:customerId")

orderRouter.post(
  "/reward",
  requireCustomerMiddleware,
  validatePayloadMiddleware(createOrderValidation),
  createOrderWithRewardPointHandler
);

orderRouter.patch(
  "/:orderId",
  requireCustomerMiddleware,
  validatePayloadMiddleware(returnOrderValidation),
  returnOrderHandler
);

export default orderRouter;
