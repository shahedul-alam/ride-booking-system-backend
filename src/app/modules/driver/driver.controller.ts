import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import driverServices from "./driver.service";
import { JwtPayload } from "jsonwebtoken";
import { createUserToken } from "../../utils/token";
import { setAuthCookie } from "../../utils/setCookie";

const createDriver = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.tokenUser as JwtPayload;
    const driver = await driverServices.createDriver(
      req.body,
      decodedToken.userId
    );

    const JwtPayload = {
      userId: driver?.user._id,
      role: driver?.user.role,
      email: driver?.user.email,
    };

    const userTokens = createUserToken(JwtPayload);

    setAuthCookie(res, userTokens);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Driver profile created successfully",
      data: {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        driver: driver,
      },
    });
  }
);

const updateDriverAvailability = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.tokenUser as JwtPayload;
    const { availabilityStatus } = req.body;

    const driver = await driverServices.updateDriverAvailability(
      decodedToken.userId,
      availabilityStatus
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Updated availability status",
      data: driver,
    });
  }
);

const getEarningHistory = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.tokenUser as JwtPayload;

    const earningHistory = await driverServices.getEarningHistory(
      decodedToken.userId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Retrieved earning history successfully",
      data: earningHistory,
    });
  }
);

const getAvailableRides = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.tokenUser as JwtPayload;

    const allAvailableRides = await driverServices.getAvailableRides(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Retrieved available rides successfully",
      data: allAvailableRides,
    });
  }
);

const acceptRide = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const rideId = req.params.id;
    const { userId } = req.tokenUser as JwtPayload;

    const acceptedRide = await driverServices.acceptRide(userId, rideId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride accepted successfully",
      data: acceptedRide,
    });
  }
);

const updateRideStatus = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const rideId = req.params.id;
    const { rideStatus } = req.body;
    const { userId } = req.tokenUser as JwtPayload;

    const updatedRide = await driverServices.updateRideStatus(
      userId,
      rideId,
      rideStatus
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride status updated successfully",
      data: updatedRide,
    });
  }
);

const driverControllers = {
  createDriver,
  updateDriverAvailability,
  getEarningHistory,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
};

export default driverControllers;
