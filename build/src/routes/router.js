"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const item_route_1 = __importDefault(require("./item.route"));
const order_route_1 = __importDefault(require("./order.route"));
const session_route_1 = __importDefault(require("./session.route"));
const user_route_1 = __importDefault(require("./user.route"));
const router = (0, express_1.Router)();
router.get("/check", (req, res) => {
    return res.status(200).json({ message: "OK" });
});
router.use("/users", user_route_1.default);
router.use("/sessions", session_route_1.default);
router.use("/items", item_route_1.default);
router.use("/orders", order_route_1.default);
exports.default = router;
