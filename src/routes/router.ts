import { Request, Response, Router } from "express";

import itemRouter from "./item.route";
import orderRouter from "./order.route";
import sessionRouter from "./session.route";
import userRouter from "./user.route";

const router = Router();

router.get("/check", (req: Request, res: Response) => {
  return res.status(200).json({ message: "OK" });
});

router.use("/users", userRouter);
router.use("/sessions", sessionRouter);
router.use("/items", itemRouter);
router.use("/orders", orderRouter);

export default router;
