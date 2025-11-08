import express, { Application, Request, Response } from "express";
import router from "./app/router/router";
import { notFoundHandler } from "./app/middlewares/notFound.middleware";
import globalErrorHandler from "./app/middlewares/globalError.middleware";
import passport from "passport";
import expressSession from "express-session";
import "./app/config/passport";

// creating an express app
const app: Application = express();

// middlewares
app.use(express.json());
app.use(
  expressSession({
    secret: "your secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// router
app.use("/api/v1", router);

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
