import { Router } from "express";

import { addItemQuantityHandler, createItemHandler, getItemByIdHandler, getItemsHandler, searchItemsHandler, updateItemHandler } from "../controllers/item.controller";
import requireAdminMiddleware from "../middlewares/require-admin.middleware";
import requireCustomerMiddleware from "../middlewares/require-customer.middleware";
import requireUserMiddleware from "../middlewares/require-user.middleware";
import validatePayloadMiddleware from "../middlewares/validate-payload.middleware";
import { addItemQuantityValidation, createItemValidation, getItemByIdValidation, updateItemValidation } from "../validations/item.validation";

const itemRouter = Router();

itemRouter.post(
  "/",
  requireAdminMiddleware,
  validatePayloadMiddleware(createItemValidation),
  createItemHandler
);

itemRouter.get("/", requireUserMiddleware, getItemsHandler);

itemRouter.get("/searches", requireUserMiddleware, searchItemsHandler);

itemRouter.get(
  "/:itemId",
  requireUserMiddleware,
  validatePayloadMiddleware(getItemByIdValidation),
  getItemByIdHandler
);

itemRouter.post(
  "/:itemId/quantity",
  requireAdminMiddleware,
  validatePayloadMiddleware(addItemQuantityValidation),
  addItemQuantityHandler
);

export default itemRouter;
