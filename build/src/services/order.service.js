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
exports.getItemNumber = exports.returnOrder = exports.saveRewardPoint = exports.processOrder = exports.checkItemQuantityMoreThanAvailableNumber = exports.getOrderDetailsWithItem = exports.getOrderResponse = exports.getItemAvailableNumber = exports.checkDuplicateItem = exports.updateOrder = exports.findOrders = exports.findOrder = exports.createOrder = void 0;
const lodash_1 = require("lodash");
const order_model_1 = __importDefault(require("../models/order.model"));
const converter_util_1 = __importDefault(require("../utils/converter.util"));
const item_service_1 = require("./item.service");
const user_service_1 = require("./user.service");
function createOrder(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield order_model_1.default.create(input);
    });
}
exports.createOrder = createOrder;
function findOrder(query, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield order_model_1.default.findOne(query, options);
    });
}
exports.findOrder = findOrder;
function findOrders(query, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield order_model_1.default.find(query, options);
    });
}
exports.findOrders = findOrders;
function updateOrder(query, update, options = { new: true }) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield order_model_1.default.findOneAndUpdate(query, update, options);
    });
}
exports.updateOrder = updateOrder;
function checkDuplicateItem(orderDetails) {
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
exports.checkDuplicateItem = checkDuplicateItem;
function getItemAvailableNumber(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield (0, item_service_1.findItem)({ _id: itemId });
        if (!item) {
            return 0;
        }
        let rentedNumber = 0;
        const rentedOrders = yield findOrders({ returned: false });
        for (const order of rentedOrders) {
            for (const orderDetail of order.orderDetails) {
                if (orderDetail.itemId.toString() !== item._id.toString()) {
                    continue;
                }
                rentedNumber += orderDetail.quantity;
            }
        }
        return item.copiesNumber - rentedNumber;
    });
}
exports.getItemAvailableNumber = getItemAvailableNumber;
function getOrderResponse(order) {
    return __awaiter(this, void 0, void 0, function* () {
        const orderDetailsWithItem = (yield getOrderDetailsWithItem(order.orderDetails));
        let orderDetailsWithItemAndAvailableNumber = [];
        for (let orderDetailWithItem of orderDetailsWithItem) {
            const orderDetailWithItemAndAvailableNumber = {
                item: Object.assign(Object.assign({}, orderDetailWithItem.item.toJSON()), { availableNumber: yield getItemAvailableNumber(orderDetailWithItem.item._id) }),
                quantity: orderDetailWithItem.quantity,
            };
            orderDetailsWithItemAndAvailableNumber.push(orderDetailWithItemAndAvailableNumber);
        }
        return Object.assign(Object.assign({}, (0, lodash_1.omit)(order.toJSON(), "orderDetails")), { orderDetails: orderDetailsWithItemAndAvailableNumber });
    });
}
exports.getOrderResponse = getOrderResponse;
function getOrderDetailsWithItem(orderDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        let orderDetailsWithItem = new Array();
        for (const orderDetail of orderDetails) {
            const item = yield (0, item_service_1.findItem)({ _id: orderDetail.itemId });
            if (!item) {
                return null;
            }
            const availableNumber = yield getItemAvailableNumber(item._id);
            orderDetailsWithItem.push({
                item,
                quantity: orderDetail.quantity,
            });
        }
        return orderDetailsWithItem;
    });
}
exports.getOrderDetailsWithItem = getOrderDetailsWithItem;
function checkItemQuantityMoreThanAvailableNumber(orderDetailsWithItem) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let orderDetailWithItem of orderDetailsWithItem) {
            if (orderDetailWithItem === null) {
                return "Item is not existed";
            }
            if (orderDetailWithItem.item.availableNumber < orderDetailWithItem.quantity) {
                return `Item ${orderDetailWithItem.item.name} is not enough`;
            }
        }
        return null;
    });
}
exports.checkItemQuantityMoreThanAvailableNumber = checkItemQuantityMoreThanAvailableNumber;
function processOrder(orderDetailsWithItem, customer, useRewardPoint = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const totalValue = orderDetailsWithItem.reduce((total, orderDetailWithItem) => total + orderDetailWithItem.item.rentalFee * orderDetailWithItem.quantity, 0);
        const totalQuantity = orderDetailsWithItem.reduce((total, orderDetailWithItem) => total + orderDetailWithItem.quantity, 0);
        const rentedOrders = yield findOrders({
            customerId: customer._id,
            returned: false,
        });
        if (useRewardPoint) {
            if (customer.rewardPoint <
                totalQuantity * 100
            // ||
            // 10 * (rentedOrders.length + 1) > customer.balance
            ) {
                return false;
            }
            yield (0, user_service_1.addRewardPoint)(customer._id, -100 * totalQuantity);
            return true;
        }
        // Assume the deny fee for each late returned order is $10
        if (totalValue + 10 * (rentedOrders.length + 1) > customer.balance) {
            return false;
        }
        // Update user balance
        yield (0, user_service_1.addBalance)(customer._id, -totalValue);
        return true;
    });
}
exports.processOrder = processOrder;
function saveRewardPoint(customerId, orderDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        const customer = yield (0, user_service_1.findUser)({ _id: customerId });
        if (!customer || customer.accountType !== "vip") {
            return null;
        }
        const totalQuantity = orderDetails.reduce((sum, orderDetail) => (sum += orderDetail.quantity), 0);
        const newRewardPoint = customer.rewardPoint + totalQuantity * 10;
        yield (0, user_service_1.addRewardPoint)(customerId, totalQuantity * 10);
        return newRewardPoint;
    });
}
exports.saveRewardPoint = saveRewardPoint;
function returnOrder(orderId, customerId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Find order and user
        const order = yield findOrder({ _id: orderId, customerId });
        const customer = yield (0, user_service_1.findUser)({ _id: customerId });
        if (!order || !customer) {
            return null;
        }
        // Update the returned status of order
        yield updateOrder({ _id: orderId }, { returned: true });
        // Promote the customer account type
        yield (0, user_service_1.promoteCustomer)(customerId);
        if (Date.now() >
            converter_util_1.default.dateToNumber(order.createdAt) +
                order.rentalDuration * 24 * 3600 * 1000) {
            yield (0, user_service_1.addBalance)(customerId, -10);
            return false;
        }
        return true;
    });
}
exports.returnOrder = returnOrder;
function getItemNumber(customerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const orders = yield findOrders({ customerId, returned: true });
        let ans = 0;
        for (const order of orders) {
            for (const orderDetail of order.orderDetails) {
                ans += orderDetail.quantity;
            }
        }
        return ans;
    });
}
exports.getItemNumber = getItemNumber;
