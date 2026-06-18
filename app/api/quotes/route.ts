import { NextRequest } from "next/server";
import {
  calculatePricing,
  validateCoordinates,
  isWithinServiceArea,
} from "@/lib/pricing";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { ErrorCode } from "@/types";
import type { VehicleType, Coordinates } from "@/types";

const VALID_VEHICLES: VehicleType[] = ["BIKE", "VAN", "TRUCK", "HAULAGE"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickup, dropoff, vehicleType } = body as {
      pickup: Coordinates;
      dropoff: Coordinates;
      vehicleType: VehicleType;
    };

    if (!pickup || !dropoff || !vehicleType) {
      return createErrorResponse(
        ErrorCode.MISSING_FIELDS,
        "pickup, dropoff, and vehicleType are required",
        "/api/quotes"
      );
    }

    if (!validateCoordinates(pickup) || !validateCoordinates(dropoff)) {
      return createErrorResponse(
        ErrorCode.INVALID_COORDINATES,
        "Invalid coordinate values",
        "/api/quotes"
      );
    }

    if (!isWithinServiceArea(pickup) || !isWithinServiceArea(dropoff)) {
      return createErrorResponse(
        ErrorCode.LOCATION_OUT_OF_SERVICE,
        "Location is outside our Lagos service area",
        "/api/quotes"
      );
    }

    if (!VALID_VEHICLES.includes(vehicleType)) {
      return createErrorResponse(
        ErrorCode.INVALID_VEHICLE_TYPE,
        `Invalid vehicle type. Must be one of: ${VALID_VEHICLES.join(", ")}`,
        "/api/quotes"
      );
    }

    const quote = calculatePricing(pickup, dropoff, vehicleType);
    return createSuccessResponse(quote);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Pricing calculation failed";
    return createErrorResponse(
      ErrorCode.PRICING_ERROR,
      process.env.NODE_ENV === "development"
        ? message
        : "Failed to calculate price",
      "/api/quotes"
    );
  }
}
