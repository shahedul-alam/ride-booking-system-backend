import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { RideStatus } from "../modules/ride/ride.interface";
import Ride from "../modules/ride/ride.model";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../errorHelpers/appError";

export const checkActiveRideStatus =
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.tokenUser as JwtPayload;

      const activeStatuses = [
        RideStatus.REQUESTED,
        RideStatus.ACCEPTED,
        RideStatus.DRIVER_ARRIVED,
        RideStatus.PICKED_UP,
      ];

      const activeRide = await Ride.findOne({
        user: userId,
        status: { $in: activeStatuses },
      });

      if (activeRide) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `You currently have an active ride (Status: ${activeRide.status}). Please complete or cancel it before requesting a new one.`
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
