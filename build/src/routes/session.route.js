"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const session_controller_1 = require("../controllers/session.controller");
const sessionRouter = (0, express_1.Router)();
sessionRouter.post("/", session_controller_1.createSessionHandler);
exports.default = sessionRouter;
