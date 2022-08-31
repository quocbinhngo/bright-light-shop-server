import config from "config";
import http from "http";

import app from "./app";
import loggerUtil from "./utils/logger.util";
import mongoUtil from "./utils/mongo.util";

const PORT = config.get<number>("PORT");
const server = http.createServer(app);

server.listen(PORT, async () => {
  await mongoUtil.connect();
  loggerUtil.info(`Listening on PORT ${PORT}`);
});
