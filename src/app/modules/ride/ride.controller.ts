import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import rideServices from "./ride.service";

const createRide = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.tokenUser as JwtPayload;
  const { pickup, destination } = req.body;

  const rideDetails = await rideServices.createRide(pickup, destination, userId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Ride created successfully",
    data: rideDetails,
  });
});

const rideControllers = {
  createRide,
};

export default rideControllers;
