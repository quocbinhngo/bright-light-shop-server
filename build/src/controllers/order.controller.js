"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnOrderHandler = exports.getAllOrdersHandler = exports.createOrderWithRewardPointHandler = exports.createOrderHandler = void 0;
const lodash_1 = require("lodash");
const order_service_1 = require("../services/order.service");
const user_service_1 = require("../services/user.service");
const paginator_util_1 = __importDefault(require("../utils/paginator.util"));
function createOrderHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const customerId = (0, lodash_1.get)(req, "headers.user-id");
            const { orderDetails, rentalDuration } = req.body;
            const customer = yield (0, user_service_1.findUser)({ _id: customerId });
            if (!customer || customer.accountType === "admin") {
                return res.status(403).json("You are not authenticated");
            }
            // Check whether the guest make 2 day ren
            if (customer.accountType === "guest" && rentalDuration === 2) {
                return res.status(403).json("Guest account cannot make 2-day rental");
            }
            const totalQuantity = orderDetails.reduce((value, orderDetail) => value + orderDetail["quantity"], 0);
            if (customer.accountType === "guest" && totalQuantity > 2) {
                return res
                    .status(403)
                    .json("Guest account cannot rent more than 2 items");
            }
            // Check whether duplicate item
            if ((0, order_service_1.checkDuplicateItem)(orderDetails)) {
                return res.status(400).json("You make a duplicate item selection");
            }
            // Check whether the item is available or not
            const orderDetailsWithItem = yield (0, order_service_1.getOrderDetailsWithItem)(orderDetails);
            if (!orderDetailsWithItem) {
                return res.status(400).json("Item is not available");
            }
            const isItemQuantityMoreThanAvailableNumber = yield (0, order_service_1.checkItemQuantityMoreThanAvailableNumber)(orderDetailsWithItem);
            if (isItemQuantityMoreThanAvailableNumber) {
                return res.status(400).json(orderDetailsWithItem);
            }
            if (!(yield (0, order_service_1.processOrder)(orderDetailsWithItem, customer))) {
                return res
                    .status(400)
                    .json("Your balance is not enough for creating order");
            }
            yield (0, order_service_1.createOrder)({ orderDetails, rentalDuration, customerId });
            const newRewardPoint = yield (0, order_service_1.saveRewardPoint)(customerId, orderDetails);
            if (!newRewardPoint) {
                return res.status(201).json("Create order successfully");
            }
            return res
                .status(201)
                .json(`Create order successfully. Your current reward points now is ${newRewardPoint}`);
        }
        catch (error) {
            return res.status(500).json("Cannot create order ");
        }
    });
}
exports.createOrderHandler = createOrderHandler;
function createOrderWithRewardPointHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const customerId = (0, lodash_1.get)(req, "headers.user-id");
            const { orderDetails, rentalDuration } = req.body;
            const customer = yield (0, user_service_1.findUser)({ _id: customerId });
            if (!customer || customer.accountType !== "vip") {
                return res.status(403).json("You are not authenticated");
            }
            // Check whether the item is available or not
            const orderDetailsWithItem = yield (0, order_service_1.getOrderDetailsWithItem)(orderDetails);
            if (!orderDetailsWithItem) {
                return res.status(400).json("Item is not available");
            }
            const isItemQuantityMoreThanAvailableNumber = yield (0, order_service_1.checkItemQuantityMoreThanAvailableNumber)(orderDetailsWithItem);
            if (isItemQuantityMoreThanAvailableNumber) {
                return res.status(400).json(orderDetailsWithItem);
            }
            if (!(yield (0, order_service_1.processOrder)(orderDetailsWithItem, customer, true))) {
                return res
                    .status(400)
                    .json("Your reward point is not enough for creating order");
            }
            yield (0, order_service_1.createOrder)({ orderDetails, rentalDuration, customerId });
            const rewardPoint = (yield (0, user_service_1.findUser)({ _id: customerId }))
                .rewardPoint;
            return res
                .status(201)
                .json(`Create order successfully. Your current reward points now is ${rewardPoint}`);
        }
        catch (error) {
            return res.status(500).json("Cannot create order with reward point");
        }
    });
}
exports.createOrderWithRewardPointHandler = createOrderWithRewardPointHandler;
function getAllOrdersHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const page = req.query.page ? +req.query.page : 1;
            const user = res.locals.user;
            const orders = yield (0, order_service_1.findOrders)({ customerId: user._id });
            const ordersResponse = yield Promise.all(orders.map((order) => __awaiter(this, void 0, void 0, function* () { return yield (0, order_service_1.getOrderResponse)(order); })));
            return res
                .status(200)
                .json(paginator_util_1.default.paginate(ordersResponse, page, 5));
        }
        catch (error) {
            return res.status(500).json("Cannot get all orders");
        }
    });
}
exports.getAllOrdersHandler = getAllOrdersHandler;
function returnOrderHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { orderId } = req.params;
            const userId = (0, lodash_1.get)(req, "headers.user-id");
            const order = yield (0, order_service_1.findOrder)({ _id: orderId, customerId: userId });
            if (!order) {
                return res.status(400).json("You do not have this order");
            }
            const isOntime = yield (0, order_service_1.returnOrder)(orderId, userId);
            if (!isOntime) {
                const balance = (yield (0, user_service_1.findUser)({ _id: userId }))
                    .balance;
                return res
                    .status(200)
                    .json(`Return order late. You are fine with $10. Now your balance is ${balance}`);
            }
            return res.status(200).json("Return order on time. Thank you for renting");
        }
        catch (error) {
            return res.status(500).json("Cannot return order");
        }
    });
}
exports.returnOrderHandler = returnOrderHandler;
