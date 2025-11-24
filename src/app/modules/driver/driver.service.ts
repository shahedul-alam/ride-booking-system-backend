import mongoose from "mongoose";
import {
  DriverApprovalStatus,
  DriverAvailabilityStatus,
  IDriver,
  IGeoPoint,
} from "./driver.interface";
import User from "../user/user.model";
import { Driver } from "./driver.model";
import { Role } from "../user/user.interface";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { RideStatus } from "../ride/ride.interface";
import Ride from "../ride/ride.model";

const AVAILABLE_RIDE_RADIUS_KM = 5;

const createDriver = async (payload: Partial<IDriver>, userId: string) => {
  const session = await mongoose.startSession();

  try {
    const driverAccountInfo = await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);

      if (!user?.phone || !user?.address) {
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const driver: any = await Driver.findOne({ user: userId })
        .session(session)
        .populate("user", "name email role phone address");

      return driver;
    });

    return driverAccountInfo;
  } finally {
    session.endSession();
  }
};

const updateDriverAvailability = async (
  userId: string,
  status: DriverAvailabilityStatus.ONLINE | DriverAvailabilityStatus.OFFLINE
) => {
  const driver = await Driver.findOne({ user: userId });

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found.");
  }

  if (!(driver.approvalStatus === DriverApprovalStatus.APPROVED)) {
    throw new AppError(httpStatus.BAD_REQUEST, "You can't update your status.");
  }

  const updatedProfile = await Driver.findOneAndUpdate(
    { user: userId },
    { availabilityStatus: status },
    { new: true }
  );

  if (!updatedProfile) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Updating availability status failed."
    );
  }

  return updatedProfile;
};

// for web socket to handle
const updateDriverLocation = async (
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
        $in: [DriverApprovalStatus.APPROVED],
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

const earnings = async (userId: string) => {
  const driver = await Driver.findOne({ user: userId });

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found.");
  }

  if (!(driver.approvalStatus === DriverApprovalStatus.APPROVED)) {
    throw new AppError(httpStatus.BAD_REQUEST, "You can't see your earnings.");
  }

  return driver.totalEarnings;
};

const getAvailableRides = async (driverUserId: string) => {
  const driverProfile = await Driver.findOne({ user: driverUserId });

  if (!driverProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found.");
  }

  if (!(driverProfile.approvalStatus === DriverApprovalStatus.APPROVED)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Profile not approved. Can't see available rides."
    );
  }

  // Ensure driver is online and has a location set
  if (
    driverProfile.availabilityStatus !== DriverAvailabilityStatus.ONLINE ||
    !driverProfile.currentLocation
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Driver must be online and streaming location to see available rides."
    );
  }

  const driverCoordinates = driverProfile.currentLocation.coordinates;

  // Perform Geospatial Query to find nearby PENDING rides
  const availableRides = await Ride.find({
    status: RideStatus.REQUESTED,

    // CRITICAL: Geospatial $near query on the RIDE's pickup location
    // We are searching the RIDE collection, using the DRIVER's location as the anchor point.
    pickup: {
      $near: {
        $geometry: {
          type: "Point",
          // MongoDB uses [Longitude, Latitude]
          coordinates: driverCoordinates,
        },
        // Max distance in meters (5 km * 1000 m/km)
        $maxDistance: AVAILABLE_RIDE_RADIUS_KM * 1000,
      },
    },
  })
    .populate("user", "name")
    .limit(20);

  return availableRides;
};

const acceptRide = async (driverUserId: string, rideId: string) => {
  const session = await mongoose.startSession();

  try {
    const updatedRide = await session.withTransaction(async () => {
      const driverProfile = await Driver.findOne({
        user: driverUserId,
      }).session(session);

      if (!driverProfile) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found.");
      }

      if (!(driverProfile.approvalStatus === DriverApprovalStatus.APPROVED)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Profile not approved. Can't accept available rides."
        );
      }

      if (
        driverProfile.availabilityStatus !== DriverAvailabilityStatus.ONLINE ||
        !driverProfile.currentLocation
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Driver must be online and streaming location to see available rides."
        );
      }

      await Driver.findOneAndUpdate(
        { user: driverUserId },
        { availabilityStatus: DriverAvailabilityStatus.ON_RIDE },
        { session: session }
      );

      const acceptedTime = new Date();
      const rideAfterDriverAssigned = await Ride.findByIdAndUpdate(
        rideId,
        {
          driver: driverProfile._id,
          status: RideStatus.ACCEPTED,
          "timestamps.acceptedAt": acceptedTime,
        },
        { new: true, runValidators: true, session: session }
      ).populate({
        path: "driver",
        select: "vehicleInfo currentLocation user",
        populate: {
          path: "user",
          select: "name phone picture",
        },
      });

      return rideAfterDriverAssigned;
    });

    return updatedRide;
  } finally {
    session.endSession();
  }
};

const driverServices = {
  createDriver,
  updateDriverAvailability,
  updateDriverLocation,
  earnings,
  getAvailableRides,
  acceptRide,
};

export default driverServices;
