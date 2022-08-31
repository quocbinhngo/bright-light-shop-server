import cors from "cors";
import express from "express";
import morgan from "morgan";

import deserializeUserMiddleware from "./middlewares/deserialize-user.middleware";
import router from "./routes/router";

const app = express();

app.use(cors({}));
app.use(morgan("combined"));
app.use(express.json());

app.use(deserializeUserMiddleware);

app.use("/api", router);

export default app;
