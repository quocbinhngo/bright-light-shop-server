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
exports.promoteCustomer = exports.addRewardPoint = exports.addBalance = exports.validateUsernameAndPassword = exports.hashPassword = exports.getUserResponse = exports.getUserIdentifier = exports.getUserFullName = exports.getMaxCustomerCode = exports.updateUser = exports.findUser = exports.findUsers = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const lodash_1 = require("lodash");
const user_model_1 = __importDefault(require("../models/user.model"));
const order_service_1 = require("./order.service");
const PER_PAGE = 10;
function createUser(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield user_model_1.default.create(input);
    });
}
exports.createUser = createUser;
function findUsers(query, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield user_model_1.default.find(query, null, options);
    });
}
exports.findUsers = findUsers;
function findUser(query, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield user_model_1.default.findOne(query, options);
    });
}
exports.findUser = findUser;
function updateUser(query, update, options = { new: true }) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield user_model_1.default.findOneAndUpdate(query, update, options);
    });
}
exports.updateUser = updateUser;
function getMaxCustomerCode() {
    return __awaiter(this, void 0, void 0, function* () {
        const customers = yield user_model_1.default.find({ accountType: { $ne: "admin" } })
            .sort({ customerCode: -1 })
            .limit(1);
        if (!customers || customers.length === 0) {
            return 0;
        }
        return customers[0].customerCode;
    });
}
exports.getMaxCustomerCode = getMaxCustomerCode;
function getUserFullName(user) {
    return (user.firstName + " " + user.lastName).toLowerCase();
}
exports.getUserFullName = getUserFullName;
function getUserIdentifier(user) {
    return ("C" + (user.customerCode || 0).toString().padStart(3, "0"));
}
exports.getUserIdentifier = getUserIdentifier;
function getUserResponse(user) {
    const identifier = getUserIdentifier(user);
    return Object.assign(Object.assign({}, (0, lodash_1.omit)(user.toJSON(), "password")), { identifier });
}
exports.getUserResponse = getUserResponse;
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = yield bcrypt_1.default.genSalt(10);
        return yield bcrypt_1.default.hash(password, salt);
    });
}
exports.hashPassword = hashPassword;
function validateUsernameAndPassword({ username, password, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield findUser({ username });
        if (!user) {
            return null;
        }
        if (!(yield bcrypt_1.default.compare(password, user.password))) {
            return null;
        }
        return user;
    });
}
exports.validateUsernameAndPassword = validateUsernameAndPassword;
function addBalance(customerId, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const customer = yield findUser({ _id: customerId });
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
    });
}
exports.addBalance = addBalance;
function addRewardPoint(customerId, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const customer = yield findUser({ _id: customerId });
        if (!customer || customer.accountType !== "vip") {
            return false;
        }
        yield updateUser({ _id: customerId }, { rewardPoint: customer.rewardPoint + amount });
        return true;
    });
}
exports.addRewardPoint = addRewardPoint;
function promoteCustomer(customerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const customer = yield findUser({ _id: customerId });
        if (!customer || customer.accountType === "admin") {
            return;
        }
        const itemNumber = yield (0, order_service_1.getItemNumber)(customerId);
        if (itemNumber >= 8) {
            yield updateUser({ _id: customerId }, { accountType: "vip" });
            return;
        }
        if (itemNumber >= 3) {
            yield updateUser({ _id: customerId }, { accountType: "regular" });
        }
    });
}
exports.promoteCustomer = promoteCustomer;
