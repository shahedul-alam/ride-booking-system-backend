/* eslint-disable no-console */
import mongoose from "mongoose";
import envVars from "./config/env";
import { Server } from "http";
import app from "./app";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to MongoDB using Mongoose");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  await startServer();
})();

/* When a SIGTERM signal is received, it indicates a request for the process to terminate gracefully. In this block: */
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Server is shutting down...");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

/* When a promise is rejected but no error handler is
attached to it, it becomes an unhandled rejection. In this block: */
process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection detected:", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

/* An uncaught exception occurs when an error is thrown but not
caught by any try/catch block or error handler. */
process.on("uncaughtException", (err) => {
  console.log("Uncaught exception detected:", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
