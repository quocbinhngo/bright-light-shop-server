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
exports.addItemQuantityHandler = exports.updateItemHandler = exports.getItemByIdHandler = exports.searchItemsHandler = exports.getItemsHandler = exports.createItemHandler = void 0;
const item_service_1 = require("../services/item.service");
const paginator_util_1 = __importDefault(require("../utils/paginator.util"));
const sorter_util_1 = __importDefault(require("../utils/sorter.util"));
function createItemHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { publishedYear, title, rentalType, copiesNumber, rentalFee, genre, imageUrl, } = req.body;
            if (!genre && (rentalType === "dvd" || rentalType === "record")) {
                return res.status(400).json("Dvd or record must have genre");
            }
            if (genre && rentalType === "game") {
                return res.status(400).json("Game does not have genre");
            }
            if (yield (0, item_service_1.findItem)({ title, publishedYear })) {
                return res.status(400).json("Title and published year is already exists");
            }
            const itemCode = ((yield (0, item_service_1.getMaxItemCode)(publishedYear)) || 0) + 1;
            const image = yield (0, item_service_1.getImageUrl)(rentalType);
            const item = yield (0, item_service_1.createItem)({
                itemCode,
                publishedYear,
                title,
                rentalType,
                copiesNumber,
                rentalFee,
                genre,
                imageUrl: imageUrl ? imageUrl : image.url,
            });
            const itemResponse = yield (0, item_service_1.getItemResponse)(item);
            return res.status(201).json(itemResponse);
        }
        catch (error) {
            return res.status(500).json("Cannot create item");
        }
    });
}
exports.createItemHandler = createItemHandler;
function getItemsHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { rentalType, status } = req.query;
            const desc = req.query.desc;
            const page = req.query.page ? +req.query.page : 1;
            const sortBy = req.query.sortBy;
            const sort = { [sortBy]: desc ? -1 : 1 };
            let items;
            if (rentalType) {
                items = yield (0, item_service_1.findItems)({ rentalType }, { sort });
            }
            else {
                items = yield (0, item_service_1.findItems)({}, { sort });
            }
            let itemsResponse = yield Promise.all(items.map((item) => __awaiter(this, void 0, void 0, function* () { return (0, item_service_1.getItemResponse)(item); })));
            if (sortBy === "_id") {
                itemsResponse = sorter_util_1.default.sortByIdentifier(itemsResponse, desc ? -1 : 1);
            }
            if (!status) {
                return res.status(200).json(paginator_util_1.default.paginate(itemsResponse, page));
            }
            if (status === "non-available") {
                const nonAvailableItemsResponse = itemsResponse.filter((item) => item.availableNumber === 0);
                return res
                    .status(200)
                    .json(paginator_util_1.default.paginate(nonAvailableItemsResponse, page));
            }
            const availableItemsResponse = itemsResponse.filter((item) => item.availableNumber > 0);
            return res
                .status(200)
                .json(paginator_util_1.default.paginate(availableItemsResponse, page));
        }
        catch (error) {
            return res.status(500).json("Cannot get items");
        }
    });
}
exports.getItemsHandler = getItemsHandler;
function searchItemsHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const page = req.query.page ? +req.query.page : 1;
            const search = req.query.search;
            const allItems = yield (0, item_service_1.findItems)({});
            if (search === "") {
                const itemsResponse = yield Promise.all(allItems.map((item) => __awaiter(this, void 0, void 0, function* () { return (0, item_service_1.getItemResponse)(item); })));
                return res.status(200).json(paginator_util_1.default.paginate(itemsResponse, page));
            }
            const items = allItems.filter((item) => item.title.toLowerCase() === search.toLowerCase() ||
                (0, item_service_1.getItemIdentifier)(item) === search);
            const itemsResponse = yield Promise.all(items.map((item) => __awaiter(this, void 0, void 0, function* () { return (0, item_service_1.getItemResponse)(item); })));
            return res.status(200).json(paginator_util_1.default.paginate(itemsResponse, page));
        }
        catch (error) {
            return res.status(500).json("Cannot get items");
        }
    });
}
exports.searchItemsHandler = searchItemsHandler;
function getItemByIdHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { itemId } = req.params;
            const item = yield (0, item_service_1.findItem)({ _id: itemId });
            if (!item) {
                return res.status(404).send("Item does not exists");
            }
            const itemResponse = yield (0, item_service_1.getItemResponse)(item);
            return res.status(200).send(itemResponse);
        }
        catch (error) {
            return res.status(500).send("Cannot get item by id");
        }
    });
}
exports.getItemByIdHandler = getItemByIdHandler;
function updateItemHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { itemId } = req.params;
            const { publishedYear, title, rentalType, copiesNumber, rentalFee, genre } = req.body;
            if ((!genre && rentalType === "dvd") || rentalType === "record") {
                return res.status(400).json("Dvd or record must have genre");
            }
            if (genre && rentalType === "game") {
                return res.status(400).json("Game does not have genre");
            }
            if (yield (0, item_service_1.findItem)({ title, publishedYear })) {
                return res.status(400).json("Title and published year is already exists");
            }
            if (!(yield (0, item_service_1.findItem)({ _id: itemId }))) {
                return res.status(400).json("Item is not existed");
            }
            const item = yield (0, item_service_1.updateItem)({ _id: itemId }, { publishedYear, title, rentalType, copiesNumber, rentalFee });
            const itemResponse = yield (0, item_service_1.getItemResponse)(item);
            return res.status(200).json(itemResponse);
        }
        catch (error) {
            return res.status(500).json("Cannot update items");
        }
    });
}
exports.updateItemHandler = updateItemHandler;
function addItemQuantityHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { itemId } = req.params;
            const { quantity } = req.body;
            const item = yield (0, item_service_1.findItem)({ _id: itemId });
            if (!item) {
                return res.status(400).json("Cannot find item");
            }
            const updatedItem = yield (0, item_service_1.updateItem)({ _id: itemId }, { copiesNumber: item.copiesNumber + quantity });
            const itemResponse = yield (0, item_service_1.getItemResponse)(updatedItem);
            return res.status(200).json(itemResponse);
        }
        catch (error) {
            return res.status(500).json("Cannot add item quantity");
        }
    });
}
exports.addItemQuantityHandler = addItemQuantityHandler;
