import type { VehicleType, PricingQuote, Coordinates } from "@/types";

interface VehicleRates {
  basePrice: number;
  perKmRate: number;
  avgSpeedKmH: number;
}

const VEHICLE_RATES: Record<VehicleType, VehicleRates> = {
  BIKE: { basePrice: 2500, perKmRate: 200, avgSpeedKmH: 35 },
  VAN: { basePrice: 5000, perKmRate: 300, avgSpeedKmH: 30 },
  TRUCK: { basePrice: 8000, perKmRate: 400, avgSpeedKmH: 25 },
  HAULAGE: { basePrice: 15000, perKmRate: 600, avgSpeedKmH: 20 },
};

interface SurgeWindow {
  startHour: number;
  endHour: number;
  multiplier: number;
  label: string;
}

const SURGE_WINDOWS: SurgeWindow[] = [
  { startHour: 7, endHour: 9, multiplier: 1.5, label: "Morning rush" },
  { startHour: 13, endHour: 14, multiplier: 1.2, label: "Afternoon peak" },
  { startHour: 17, endHour: 20, multiplier: 1.4, label: "Evening rush" },
  { startHour: 20, endHour: 6, multiplier: 1.3, label: "Night surge" },
];

const LAGOS_BOUNDS = {
  minLat: 6.3,
  maxLat: 6.7,
  minLng: 3.1,
  maxLng: 3.7,
};

const MIN_PRICE = 1500;
const MAX_PRICE = 500000;

function toRadians(deg: number): number {
  return deg * (Math.PI / 180);
}

export function calculateDistance(
  pickup: Coordinates,
  dropoff: Coordinates
): number {
  const R = 6371;
  const dLat = toRadians(dropoff.lat - pickup.lat);
  const dLng = toRadians(dropoff.lng - pickup.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(pickup.lat)) *
      Math.cos(toRadians(dropoff.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export function getSurgeMultiplier(date?: Date): {
  multiplier: number;
  label: string | null;
} {
  const now = date || new Date();
  const hour = now.getHours();

  for (const window of SURGE_WINDOWS) {
    if (window.startHour < window.endHour) {
      if (hour >= window.startHour && hour < window.endHour) {
        return { multiplier: window.multiplier, label: window.label };
      }
    } else {
      if (hour >= window.startHour || hour < window.endHour) {
        return { multiplier: window.multiplier, label: window.label };
      }
    }
  }

  return { multiplier: 1.0, label: null };
}

export function isWithinServiceArea(coords: Coordinates): boolean {
  return (
    coords.lat >= LAGOS_BOUNDS.minLat &&
    coords.lat <= LAGOS_BOUNDS.maxLat &&
    coords.lng >= LAGOS_BOUNDS.minLng &&
    coords.lng <= LAGOS_BOUNDS.maxLng
  );
}

export function validateCoordinates(coords: Coordinates): boolean {
  return (
    typeof coords.lat === "number" &&
    typeof coords.lng === "number" &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180 &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng)
  );
}

export function calculatePricing(
  pickup: Coordinates,
  dropoff: Coordinates,
  vehicleType: VehicleType,
  date?: Date
): PricingQuote {
  const rates = VEHICLE_RATES[vehicleType];
  if (!rates) {
    throw new Error(`Invalid vehicle type: ${vehicleType}`);
  }

  const distance = calculateDistance(pickup, dropoff);
  const { multiplier: surgeMultiplier } = getSurgeMultiplier(date);

  const basePrice = rates.basePrice;
  const distancePrice = Math.round(distance * rates.perKmRate);
  const subtotal = basePrice + distancePrice;
  const surgePrice =
    surgeMultiplier > 1 ? Math.round(subtotal * (surgeMultiplier - 1)) : 0;
  const rawTotal = subtotal + surgePrice;
  const totalPrice = Math.min(Math.max(rawTotal, MIN_PRICE), MAX_PRICE);

  const estimatedTime = Math.max(
    5,
    Math.round((distance / rates.avgSpeedKmH) * 60)
  );

  return {
    vehicleType,
    basePrice,
    distancePrice,
    surgeMultiplier,
    surgePrice,
    totalPrice,
    distance,
    estimatedTime,
    breakdown: {
      base: basePrice,
      distanceCharge: distancePrice,
      surgeCharge: surgePrice,
      total: totalPrice,
    },
  };
}
