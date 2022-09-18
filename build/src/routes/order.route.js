"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const require_customer_middleware_1 = __importDefault(require("../middlewares/require-customer.middleware"));
const validate_payload_middleware_1 = __importDefault(require("../middlewares/validate-payload.middleware"));
const order_validation_1 = require("../validations/order.validation");
const orderRouter = (0, express_1.Router)();
orderRouter.post("/", require_customer_middleware_1.default, (0, validate_payload_middleware_1.default)(order_validation_1.createOrderValidation), order_controller_1.createOrderHandler);
// Customer get all their orders
orderRouter.get("/", require_customer_middleware_1.default, order_controller_1.getAllOrdersHandler);
// Get specific info of an order
// orderRouter.get("/:orderId", getOrderByIdHandler);
// Admin get all order of a customer
// orderRouter.get("/customers/:customerId")
orderRouter.post("/reward", require_customer_middleware_1.default, (0, validate_payload_middleware_1.default)(order_validation_1.createOrderValidation), order_controller_1.createOrderWithRewardPointHandler);
orderRouter.patch("/:orderId", require_customer_middleware_1.default, (0, validate_payload_middleware_1.default)(order_validation_1.returnOrderValidation), order_controller_1.returnOrderHandler);
exports.default = orderRouter;
