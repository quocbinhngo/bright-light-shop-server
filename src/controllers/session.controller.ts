import { Request, Response } from "express";

import { findUser, getUserResponse, validateUsernameAndPassword } from "../services/user.service";
import { CreateSessionPayload } from "../validations/session.validation";

export async function createSessionHandler(
  req: Request<{}, {}, CreateSessionPayload["body"]>,
  res: Response
) {
  try {
    const { username, password } = req.body;

    const user = await validateUsernameAndPassword({ username, password });
    if (!user) {
      return res.status(400).json("Wrong username or password");
    }

    const userResponse = getUserResponse(user);

    return res.status(200).json(userResponse);
  } catch (error: any) {
    return res.status(500).json("Cannot login to account");
  }
}
