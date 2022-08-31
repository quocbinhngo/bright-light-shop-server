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
  if (user) {
    res.locals.user = user;
  }

  next();
}
