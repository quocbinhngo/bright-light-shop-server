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
const lodash_1 = require("lodash");
const user_service_1 = require("../services/user.service");
function default_1(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = (0, lodash_1.get)(req, "headers.user-id");
        const user = yield (0, user_service_1.findUser)({ _id: userId });
        if (user) {
            res.locals.user = user;
        }
        next();
    });
}
exports.default = default_1;
