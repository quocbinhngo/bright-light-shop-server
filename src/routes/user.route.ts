import { Router } from "express";

import { addBalanceHandler, createAdminAccountHandler, createCustomerAccountHandler, getCustomerByIdHandler, getCustomershandler, getUserHandler, searchCustomersHandler, updateUserHandler } from "../controllers/user.controller";
import requireAdminMiddleware from "../middlewares/require-admin.middleware";
import requireCustomerMiddleware from "../middlewares/require-customer.middleware";
import requireUserMiddleware from "../middlewares/require-user.middleware";
import validatePayloadMiddleware from "../middlewares/validate-payload.middleware";
import { addBalanceValidation, createAccountValidation } from "../validations/user.validation";

const userRouter = Router();

userRouter.get("/", requireUserMiddleware, getUserHandler);

userRouter.patch("/", requireUserMiddleware, updateUserHandler);

userRouter.post(
  "/customers",
  validatePayloadMiddleware(createAccountValidation),
  createCustomerAccountHandler
);

userRouter.get("/customers", requireAdminMiddleware, getCustomershandler);

userRouter.get(
  "/customers/searches",
  requireUserMiddleware,
  searchCustomersHandler
);

userRouter.get(
  "/customers/:id",
  requireAdminMiddleware,
  getCustomerByIdHandler
);

userRouter.post(
  "/admins",
  // requireAdminMiddleware,
  validatePayloadMiddleware(createAccountValidation),
  createAdminAccountHandler
);

userRouter.patch(
  "/customers/balance",
  requireCustomerMiddleware,
  validatePayloadMiddleware(addBalanceValidation),
  addBalanceHandler
);

// userRouter.post("/admins", createAdminAccountHandler);
export default userRouter;
