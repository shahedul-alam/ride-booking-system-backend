import express, { Application, Request, Response } from "express"

// creating an express app
const app: Application = express();

// entry point of the server
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the ride-booking system server");
});

export default app;

