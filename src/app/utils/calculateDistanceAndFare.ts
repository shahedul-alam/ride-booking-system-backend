import { DistanceUnits, FareUnits, IDistance, IFare, ILocation } from "../modules/ride/ride.interface";

export const calculateDistance = (
  location1: ILocation,
  location2: ILocation
): IDistance => {
  // Earth's radius in kilometers (mean radius)
  const R = 6371;

  // Helper function to convert degrees to radians
  const toRad = (degrees: number): number => degrees * (Math.PI / 180);

  // Latitude and Longitude in Radians
  const lat1 = toRad(location1.coordinates[1]);
  const lat2 = toRad(location2.coordinates[1]);
  const lng1 = toRad(location1.coordinates[0]);
  const lng2 = toRad(location2.coordinates[0]);

  // Difference in coordinates
  const deltaLat = lat2 - lat1;
  const deltaLng = lng2 - lng1;

  // Haversine Formula components
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate the distance
  const distance = R * c;

  const result: IDistance = {
    distance: parseFloat(distance.toFixed(2)),
    unit: DistanceUnits.KM,
  };

  return result;
};

export const calculateFare = (distance: number, pricePerDistance: number): IFare => {
  const result: IFare = {
    fare: distance * pricePerDistance,
    unit: FareUnits.BDT,
  };

  return result;
};