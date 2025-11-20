import { z } from "zod";
import {
  DriverApprovalStatus,
  DriverAvailabilityStatus,
  VehicleType,
} from "./driver.interface";

const GeoPointSchema = z.object({
  type: z.literal("Point").default("Point"),
  // Coordinates are [longitude, latitude] and must be an array of exactly 2 numbers
  coordinates: z
    .array(z.number())
    .length(2, "Coordinates must contain [longitude, latitude]."),
});

const VehicleInfoSchema = z.object({
  brand: z.string().min(2, "Make must be at least 2 characters."),
  model: z.string().min(2, "Model must be at least 2 characters."),
  licensePlate: z
    .string()
    .regex(/^[A-Z0-9-]{3,15}$/, "Invalid license plate format."),
  type: z.enum(Object.values(VehicleType)),
});

export const createDriverZodSchema = z.object({
  vehicleInfo: VehicleInfoSchema,
  // currentLocation: GeoPointSchema.optional(),
  // approvalStatus: z.enum(Object.values(DriverApprovalStatus)).optional(),
  // availabilityStatus: z
  //   .enum(Object.values(DriverAvailabilityStatus))
  //   .optional(),
  // totalEarnings: z.number().optional(),
});

export const updateDriverZodSchema = z.object({
  vehicleInfo: VehicleInfoSchema.partial().optional(),
  currentLocation: GeoPointSchema.optional(),
  approvalStatus: z.enum(Object.values(DriverApprovalStatus)).optional(),
  availabilityStatus: z
    .enum(Object.values(DriverAvailabilityStatus))
    .optional(),
  totalEarnings: z.number().optional(),
}); 
