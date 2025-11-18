import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import driverServices from "./driver.service";
import { JwtPayload } from "jsonwebtoken";

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

const driverControllers = {
  createDriver,
};

export default driverControllers;
