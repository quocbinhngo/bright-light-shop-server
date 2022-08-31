import { Router } from "express";
import { createSessionHandler } from "../controllers/session.controller";

const sessionRouter = Router();

sessionRouter.post("/", createSessionHandler);

export default sessionRouter;
