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
  type: z.literal("Point").default("Point"),
  coordinates: z
    .array(z.number())
    .length(2, "Coordinates must contain [longitude, latitude]."),
  address: z.string().trim().min(3, "Address must be at least 3 characters."),
});

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
});
