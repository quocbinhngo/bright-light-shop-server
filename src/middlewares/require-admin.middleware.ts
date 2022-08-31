import { NextFunction, Request, Response } from "express";
import { get } from "lodash";

import { findUser } from "../services/user.service";

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = get(req, "headers.user-id");
  const user = await findUser({ _id: userId });

  if (get(user, "accountType") !== "admin") {
    return res.status(403).json("You are not authenticated");
  }

  next();
}
