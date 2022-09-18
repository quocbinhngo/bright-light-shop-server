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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSessionHandler = void 0;
const user_service_1 = require("../services/user.service");
function createSessionHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, password } = req.body;
            const user = yield (0, user_service_1.validateUsernameAndPassword)({ username, password });
            if (!user) {
                return res.status(400).json("Wrong username or password");
            }
            const userResponse = (0, user_service_1.getUserResponse)(user);
            return res.status(200).json(userResponse);
        }
        catch (error) {
            return res.status(500).json("Cannot login to account");
        }
    });
}
exports.createSessionHandler = createSessionHandler;
