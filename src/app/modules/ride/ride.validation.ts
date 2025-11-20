import { z } from "zod";

const LocationSchema = z.object({
  lat: z.number().min(-90, "Latitude must be between -90 and 90.").max(90, "Latitude must be between -90 and 90."),
  
  lng: z.number().min(-180, "Longitude must be between -180 and 180.").max(180, "Longitude must be between -180 and 180."),
  
  address: z.string().trim().min(3, "Address must be at least 3 characters.").optional(),
});

export const createRideZodSchema = z.object({
  pickup: LocationSchema,
  destination: LocationSchema,
});
