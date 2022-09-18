"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const deserialize_user_middleware_1 = __importDefault(require("./middlewares/deserialize-user.middleware"));
const router_1 = __importDefault(require("./routes/router"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({}));
app.use((0, morgan_1.default)("combined"));
app.use(express_1.default.json());
app.use(deserialize_user_middleware_1.default);
app.use("/api", router_1.default);
exports.default = app;
