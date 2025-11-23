import mongoose from "mongoose";
import { z } from "zod";
import { RideStatus } from "./ride.interface";

export const objectIdSchema = z.string().refine(
  (val) => {
    return mongoose.Types.ObjectId.isValid(val);
  },
  {
    message: "Invalid MongoDB ObjectId format.",
  }
);

const LocationSchema = z.object({
  lat: z
    .number()
    .min(-90, "Latitude must be between -90 and 90.")
    .max(90, "Latitude must be between -90 and 90."),

  lng: z
    .number()
    .min(-180, "Longitude must be between -180 and 180.")
    .max(180, "Longitude must be between -180 and 180."),

  address: z
    .string()
    .trim()
    .min(3, "Address must be at least 3 characters.")
    .optional(),
});

// const TimestampSchema = z.object({
//   acceptedAt: z.iso
//     .datetime("AcceptedAt must be a valid ISO 8601 date string.")
//     .optional(),
//   pickedUpAt: z.iso
//     .datetime("PickedUpAt must be a valid ISO 8601 date string.")
//     .optional(),
//   completedAt: z.iso
//     .datetime("CompletedAt must be a valid ISO 8601 date string.")
//     .optional(),
//   cancelledAt: z.iso
//     .datetime("CancelledAt must be a valid ISO 8601 date string.")
//     .optional(),
// });

export const createRideZodSchema = z.object({
  pickup: LocationSchema,
  destination: LocationSchema,
});

export const updateRideZodSchema = z.object({
  driver: objectIdSchema.optional(),
  status: z.enum(Object.values(RideStatus) as [string]).optional(),
  cancellationReason: z
    .string({ message: "cancellation reason must be string" })
    .optional(),
  // timestamps: TimestampSchema.optional(),
});
