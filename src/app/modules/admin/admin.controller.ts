import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import adminServices from "./admin.service";

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const { data, meta } = await adminServices.getAllUser(
    query as Record<string, string>
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Retrieved all user successfully",
    data: data,
    meta: meta,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const user = await adminServices.getSingleUser(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

const getAllDriver = catchAsync(async (req: Request, res: Response) => {
  const allDriver = await adminServices.getAllDriver();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Retrieved all driver successfully",
    data: allDriver,
  });
});

const getAllRides = catchAsync(async (req: Request, res: Response) => {
  const allRides = await adminServices.getAllRides();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Retrieved all rides successfully",
    data: allRides,
  });
});

const updateUserActiveStatus = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { status } = req.body;

    const updatedUser = await adminServices.updateUserActiveStatus(
      userId,
      status
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Updated user active status successfully",
      data: updatedUser,
    });
  }
);

const updateDriverApprovalStatus = catchAsync(
  async (req: Request, res: Response) => {
    const driverId = req.params.id;
    const { status } = req.body;

    const updatedDriver = await adminServices.updateDriverApprovalStatus(
      driverId,
      status
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Updated driver approval status successfully",
      data: updatedDriver,
    });
  }
);

const adminControllers = {
  getAllUser,
  getSingleUser,
  getAllDriver,
  getAllRides,
  updateUserActiveStatus,
  updateDriverApprovalStatus,
};

export default adminControllers;
