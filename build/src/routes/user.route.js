"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const require_admin_middleware_1 = __importDefault(require("../middlewares/require-admin.middleware"));
const require_customer_middleware_1 = __importDefault(require("../middlewares/require-customer.middleware"));
const require_user_middleware_1 = __importDefault(require("../middlewares/require-user.middleware"));
const validate_payload_middleware_1 = __importDefault(require("../middlewares/validate-payload.middleware"));
const user_validation_1 = require("../validations/user.validation");
const userRouter = (0, express_1.Router)();
userRouter.get("/", require_user_middleware_1.default, user_controller_1.getUserHandler);
userRouter.patch("/", require_user_middleware_1.default, user_controller_1.updateUserHandler);
userRouter.post("/customers", (0, validate_payload_middleware_1.default)(user_validation_1.createAccountValidation), user_controller_1.createCustomerAccountHandler);
userRouter.get("/customers", require_admin_middleware_1.default, user_controller_1.getCustomershandler);
userRouter.get("/customers/searches", require_user_middleware_1.default, user_controller_1.searchCustomersHandler);
userRouter.get("/customers/:id", require_admin_middleware_1.default, user_controller_1.getCustomerByIdHandler);
userRouter.post("/admins", 
// requireAdminMiddleware,
(0, validate_payload_middleware_1.default)(user_validation_1.createAccountValidation), user_controller_1.createAdminAccountHandler);
userRouter.patch("/customers/balance", require_customer_middleware_1.default, (0, validate_payload_middleware_1.default)(user_validation_1.addBalanceValidation), user_controller_1.addBalanceHandler);
// userRouter.post("/admins", createAdminAccountHandler);
exports.default = userRouter;
