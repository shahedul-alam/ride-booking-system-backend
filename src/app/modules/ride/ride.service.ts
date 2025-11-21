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

const rideServices = {
  createRide,
};

export default rideServices;
