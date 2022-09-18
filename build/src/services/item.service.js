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
exports.getItemResponse = exports.getImageUrl = exports.getMaxItemCode = exports.getItemIdentifier = exports.updateItem = exports.findItems = exports.findItem = exports.createItem = void 0;
const lodash_1 = require("lodash");
const item_image_model_1 = __importDefault(require("../models/item-image.model"));
const item_model_1 = __importDefault(require("../models/item.model"));
const order_service_1 = require("./order.service");
function createItem(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = new item_model_1.default(input);
        yield item.save();
        return item;
    });
}
exports.createItem = createItem;
function findItem(query, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield item_model_1.default.findOne(query, options);
    });
}
exports.findItem = findItem;
function findItems(query, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield item_model_1.default.find(query, null, options);
    });
}
exports.findItems = findItems;
function updateItem(query, update, options = { new: true }) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield item_model_1.default.findOneAndUpdate(query, update, options);
    });
}
exports.updateItem = updateItem;
function getItemIdentifier(item) {
    return ("I" +
        item.itemCode.toString().padStart(3, "0") +
        "-" +
        item.publishedYear.toString());
}
exports.getItemIdentifier = getItemIdentifier;
function getMaxItemCode(publishedYear) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = yield item_model_1.default.find({ publishedYear })
            .sort({ itemCode: -1 })
            .limit(1);
        if (!items || !items[0]) {
            return 0;
        }
        return +items[0].itemCode;
    });
}
exports.getMaxItemCode = getMaxItemCode;
function getImageUrl(rentalType) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageUrls = yield item_image_model_1.default.find({ rentalType });
        return imageUrls[Math.floor(Math.random() * imageUrls.length)];
    });
}
exports.getImageUrl = getImageUrl;
function getItemResponse(item) {
    return __awaiter(this, void 0, void 0, function* () {
        const item1 = (0, lodash_1.omit)(item.toJSON(), ["createdAt", "updatedAt", "__v"]);
        const availableNumber = yield (0, order_service_1.getItemAvailableNumber)(item1._id);
        const identifier = getItemIdentifier(item);
        return Object.assign(Object.assign({}, item1), { availableNumber, identifier });
    });
}
exports.getItemResponse = getItemResponse;
