import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { ILocation, IRide, RideStatus } from "./ride.interface";
import Ride from "./ride.model";
import mongoose from "mongoose";
import {
  calculateDistance,
  calculateFare,
} from "../../utils/calculateDistanceAndFare";

const createRide = async (
  pickup: ILocation,
  destination: ILocation,
  userId: string
) => {
  const distanceResult = calculateDistance(pickup, destination);
  const fareResult = calculateFare(distanceResult.distance, 40);

  const payload: IRide = {
    user: new mongoose.Types.ObjectId(userId),
    pickup: pickup,
    destination: destination,
    estimatedDistance: distanceResult,
    estimatedFare: fareResult,
    status: RideStatus.REQUESTED,
  };

  const rideDetails = await Ride.create(payload);

  if (!rideDetails) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Failed to create ride request."
    );
  }

  return rideDetails;
};

const cancelRide = async (rideId: string, cancellationReason: string) => {
  const rideDetails = await Ride.findById(rideId);

  if (!rideDetails) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride is not found.");
  }

  if (rideDetails.status === RideStatus.CANCELLED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "The ride has already been cancelled"
    );
  }

  if (rideDetails.status !== RideStatus.REQUESTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Ride status is ${rideDetails.status}. Can't cancel ride!`
    );
  }

  const cancellationTime = new Date();
  const updatedRideDetails = await Ride.findByIdAndUpdate(
    rideId,
    {
      status: RideStatus.CANCELLED,
      cancellationReason: cancellationReason,
      "timestamps.cancelledAt": cancellationTime,
    },
    { new: true, runValidators: true }
  );

  return updatedRideDetails;
};

const rideServices = {
  createRide,
  cancelRide,
};

export default rideServices;
