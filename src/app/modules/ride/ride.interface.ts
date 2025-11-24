import { Types } from "mongoose";

export interface ILocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export enum RideStatus {
  REQUESTED = "requested",
  ACCEPTED = "accepted",
  DRIVER_ARRIVED = "driver_arrived",
  PICKED_UP = "picked_up",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum FareUnits {
  BDT = "BDT",
}

export enum DistanceUnits {
  KM = "km",
}

export interface ITimestamps {
  requestedAt: Date;
  acceptedAt?: Date;
  arrivedAt?: Date;
  pickedUpAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface IFare {
  fare: number;
  unit: FareUnits;
}

export interface IDistance {
  distance: number;
  unit: DistanceUnits;
}

export interface IRide {
  user: Types.ObjectId;
  driver?: Types.ObjectId;
  pickup: ILocation;
  destination: ILocation;
  status: RideStatus;
  estimatedFare: IFare;
  estimatedDistance: IDistance;
  cancellationReason?: string;
  timestamps?: ITimestamps;
}
