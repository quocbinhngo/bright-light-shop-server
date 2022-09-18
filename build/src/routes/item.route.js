"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const item_controller_1 = require("../controllers/item.controller");
const require_admin_middleware_1 = __importDefault(require("../middlewares/require-admin.middleware"));
const require_user_middleware_1 = __importDefault(require("../middlewares/require-user.middleware"));
const validate_payload_middleware_1 = __importDefault(require("../middlewares/validate-payload.middleware"));
const item_validation_1 = require("../validations/item.validation");
const itemRouter = (0, express_1.Router)();
itemRouter.post("/", require_admin_middleware_1.default, (0, validate_payload_middleware_1.default)(item_validation_1.createItemValidation), item_controller_1.createItemHandler);
itemRouter.get("/", require_user_middleware_1.default, item_controller_1.getItemsHandler);
itemRouter.get("/searches", require_user_middleware_1.default, item_controller_1.searchItemsHandler);
itemRouter.get("/:itemId", require_user_middleware_1.default, (0, validate_payload_middleware_1.default)(item_validation_1.getItemByIdValidation), item_controller_1.getItemByIdHandler);
itemRouter.post("/:itemId/quantity", require_admin_middleware_1.default, (0, validate_payload_middleware_1.default)(item_validation_1.addItemQuantityValidation), item_controller_1.addItemQuantityHandler);
exports.default = itemRouter;
