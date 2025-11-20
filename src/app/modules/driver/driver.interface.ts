import { Types } from "mongoose";

export enum DriverApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  SUSPENDED = "suspended",
}

export enum DriverAvailabilityStatus {
  OFFLINE = "offline",
  ONLINE = "online",
  ON_RIDE = "on_ride", // Driver is currently assigned to an active ride
}

export enum VehicleType {
  SEDAN = "sedan",
  SUV = "suv",
  VAN = "van",
  MOTORCYCLE = "motorcycle",
}

export interface IVehicleInfo {
  brand: string; // e.g., "Toyota"
  model: string; // e.g., "Camry"
  licensePlate: string; // e.g., "ABC-123"
  type: VehicleType; // e.g., 'sedan'
}

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IDriver {
  user: Types.ObjectId;
  vehicleInfo: IVehicleInfo;
  approvalStatus: DriverApprovalStatus; // 'pending' | 'approved' | 'suspended'
  availabilityStatus: DriverAvailabilityStatus; // 'offline' | 'online' | 'on_ride'
  currentLocation?: IGeoPoint;
  totalEarnings: number;
}
