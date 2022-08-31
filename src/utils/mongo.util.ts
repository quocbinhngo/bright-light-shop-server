import mongoose from "mongoose";
import config from "config";
import loggerUtil from "./logger.util";

const MONGO_URI = config.get<string>("MONGO_URI");

export default {
  connect: async () => {
    try {
      await mongoose.connect(MONGO_URI);
      loggerUtil.info("Connect");
    } catch (error: any) {
      loggerUtil.info(error);
      process.exit(1);
    }
  },
};
