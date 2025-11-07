import express, { Application, Request, Response } from "express";
import router from "./app/router/router";
import { notFoundHandler } from "./app/middlewares/notFound.middleware";
import globalErrorHandler from "./app/middlewares/globalError.middleware";

// creating an express app
const app: Application = express();

// middlewares
app.use(express.json());

// router
app.use("/api/vi", router);

// entry point of the server
app.get("/", (req: Request, res: Response) => {
  res.send({
    message:
      "Ride Booking API is running. Check documentation for available endpoints.",
    status: "OK",
    version: "v1",
  });
});
// route not found handler
app.use(notFoundHandler);

// global error handler
app.use(globalErrorHandler);

export default app;
