import { model, Schema } from "mongoose";
import {
  DistanceUnits,
  FareUnits,
  IDistance,
  IFare,
  ILocation,
  IRide,
  ITimestamps,
  RideStatus,
} from "./ride.interface";

const LocationSchema = new Schema<ILocation>(
  {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false, versionKey: false }
);

const TimestampsSchema = new Schema<ITimestamps>(
  {
    requestedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
    },
    pickedUpAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  { _id: false, versionKey: false }
);

const FareSchema = new Schema<IFare>(
  {
    fare: { type: Number, required: true },
    unit: { type: String, enum: Object.values(FareUnits), required: true },
  },
  { _id: false, versionKey: false }
);

const DistanceSchema = new Schema<IDistance>(
  {
    distance: { type: Number, required: true },
    unit: { type: String, enum: Object.values(DistanceUnits), required: true },
  },
  { _id: false, versionKey: false }
);

const RideSchema = new Schema<IRide>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User", // Links to the main User model
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver", // Links to the main Driver model
    },
    pickup: { type: LocationSchema, required: true },
    destination: { type: LocationSchema, required: true },
    status: {
      type: String,
      enum: Object.values(RideStatus),
      default: RideStatus.REQUESTED,
    },
    estimatedFare: {
      type: FareSchema,
      required: true,
    },
    estimatedDistance: { type: DistanceSchema, required: true },
    cancellationReason: {
      type: String,
    },
    timestamps: {
      type: TimestampsSchema,
      required: true,
      default: {} as ITimestamps,
    },
  },
  { timestamps: true, versionKey: false }
);

const Ride = model<IRide>("Ride", RideSchema);

export default Ride;
