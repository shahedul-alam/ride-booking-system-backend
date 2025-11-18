import { Schema, model } from "mongoose";
import {
  IDriver,
  DriverApprovalStatus,
  DriverAvailabilityStatus,
  VehicleType,
  IVehicleInfo,
  IGeoPoint,
} from "./driver.interface";

// 1. Define the Schema for Vehicle Info
const VehicleInfoSchema = new Schema<IVehicleInfo>(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    licensePlate: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: Object.values(VehicleType), required: true },
  },
  { _id: false }
); // Do not create a separate ID for sub-documents

// 2. Define the Schema for GeoJSON Point
const GeoPointSchema = new Schema<IGeoPoint>(
  {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

// 3. Define the Main Driver Profile Schema
const DriverSchema = new Schema<IDriver>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User", // Links to the main User model
      unique: true, // Ensures one profile per user
    },
    vehicleInfo: {
      type: VehicleInfoSchema,
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(DriverApprovalStatus),
      default: DriverApprovalStatus.PENDING,
    },
    availabilityStatus: {
      type: String,
      enum: Object.values(DriverAvailabilityStatus),
      default: DriverAvailabilityStatus.OFFLINE,
    },
    currentLocation: {
      type: GeoPointSchema,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

// 4. Create the 2dsphere Index (CRUCIAL FOR GEOSPATIAL QUERIES)
DriverSchema.index({ currentLocation: "2dsphere" });

export const Driver = model<IDriver>("Driver", DriverSchema);
