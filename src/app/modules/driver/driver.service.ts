import mongoose from "mongoose";
import { IDriver } from "./driver.interface";
import User from "../user/user.model";
import { Driver } from "./driver.model";
import { Role } from "../user/user.interface";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";

const createDriver = async (payload: Partial<IDriver>, userId: string) => {
  const session = await mongoose.startSession();

  try {
    const driverAccountInfo = await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);

      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found.");
      }

      if (!user.phone || !user.address) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Please update your profile to become a driver (phone and address required)."
        );
      }

      const [newDriver] = await Driver.create(
        [
          {
            user: userId,
            vehicleInfo: payload.vehicleInfo,
          },
        ],
        { session }
      );

      if (!newDriver) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to create driver profile."
        );
      }

      await User.findByIdAndUpdate(
        userId,
        {
          role: Role.DRIVER,
        },
        { runValidators: true, session }
      );

      const driver = await Driver.findOne({ user: userId })
        .session(session)
        .populate("user", "name email role phone address");

      return driver;
    });

    return driverAccountInfo;
  } finally {
    session.endSession();
  }
};

const driverServices = {
  createDriver,
};

export default driverServices;
