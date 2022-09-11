import config from "config";
import mongoose from "mongoose";

import loggerUtil from "./logger.util";

const MONGO_URI =
  "mongodb+srv://brightlightshop-api:8opbUeeCZVEAyqJZ@cluster0.vts82.mongodb.net/?retryWrites=true&w=majority";

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
