import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import driverServices from "./driver.service";
import { JwtPayload } from "jsonwebtoken";
import { DriverApprovalStatus, IGeoPoint } from "./driver.interface";
import { Driver } from "./driver.model";

const createDriver = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.tokenUser as JwtPayload;
    const driver = await driverServices.createDriver(
      req.body,
      decodedToken.userId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Driver profile created successfully",
      data: driver,
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

export const updateDriverLocation = async (
  driverId: string,
  lng: number,
  lat: number
) => {
  const newLocation: IGeoPoint = {
    type: "Point",
    coordinates: [lng, lat],
  };

  const updatedProfile = await Driver.findOneAndUpdate(
    {
      _id: driverId,
      approvalStatus: {
        $in: [DriverApprovalStatus.APPROVED, DriverApprovalStatus.PENDING],
      },
    },
    {
      $set: {
        currentLocation: newLocation,
      },
    },
    { new: true, runValidators: false }
  );

  if (!updatedProfile) {
    return false;
  }

  return true;
};

const driverControllers = {
  createDriver,
  updateDriverAvailability,
  updateDriverLocation
};

export default driverControllers;
