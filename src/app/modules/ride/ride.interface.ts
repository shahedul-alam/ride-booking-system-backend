import { Types } from "mongoose";

export interface ILocation {
  lat: number;
  lng: number;
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

export interface ITimestamps {
  requestedAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface IRide {
  user: Types.ObjectId;
  driver?: Types.ObjectId;
  pickup: ILocation;
  destination: ILocation;
  status: RideStatus;
  fare?: number;
  cancellationReason?: string;
  estimatedDistance?: number;
  timestamps: ITimestamps;
}
