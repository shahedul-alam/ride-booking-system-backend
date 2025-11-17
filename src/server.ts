/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import mongoose from "mongoose";
import envVars from "./app/config/env";
import { Server } from "http";
import app from "./app";
import { connectRedis } from "./app/config/redis.config";
import seedSuperAdmin from "./app/utils/seedSuperAdmin";

let server: Server;

const connectDB = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to MongoDB using Mongoose");
  } catch (err: any) {
    console.error("MongoDB connection failed:", err.message);

    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(envVars.PORT, () => {
      console.log(`Server running on port ${envVars.PORT}`);
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.error(`ERROR: Port ${envVars.PORT} is already in use.`);
      } else {
        console.error("Server failed to start:", err.message);
      }

      process.exit(1);
    });
  } catch (err: any) {
    console.error("Failed to start Express server:", err.message);
    process.exit(1);
  }
};

(async () => {
  await connectRedis();
  await startServer();
  await seedSuperAdmin();
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
