export enum ErrorCode {
  // Auth errors
  PHONE_REQUIRED = "PHONE_REQUIRED",
  INVALID_PHONE = "INVALID_PHONE",
  INVALID_OTP = "INVALID_OTP",
  OTP_EXPIRED = "OTP_EXPIRED",
  OTP_SEND_FAILED = "OTP_SEND_FAILED",
  UNAUTHORIZED = "UNAUTHORIZED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_TOKEN = "INVALID_TOKEN",
  INVALID_ROLE = "INVALID_ROLE",

  // Validation errors
  MISSING_FIELDS = "MISSING_FIELDS",
  INVALID_COORDINATES = "INVALID_COORDINATES",
  INVALID_VEHICLE_TYPE = "INVALID_VEHICLE_TYPE",
  INVALID_STATUS = "INVALID_STATUS",

  // Resource errors
  USER_NOT_FOUND = "USER_NOT_FOUND",
  JOB_NOT_FOUND = "JOB_NOT_FOUND",
  DUPLICATE_PHONE = "DUPLICATE_PHONE",

  // Business logic errors
  PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE",
  LOCATION_OUT_OF_SERVICE = "LOCATION_OUT_OF_SERVICE",
  JOB_ALREADY_ACCEPTED = "JOB_ALREADY_ACCEPTED",
  JOB_CANNOT_CANCEL = "JOB_CANNOT_CANCEL",

  // Server errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  OTP_SERVICE_ERROR = "OTP_SERVICE_ERROR",
  PRICING_ERROR = "PRICING_ERROR",
}

export type VehicleType = "BIKE" | "VAN" | "TRUCK" | "HAULAGE";

export type JobStatus =
  | "PENDING"
  | "QUOTE_SENT"
  | "ACCEPTED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_ARRIVING"
  | "IN_TRANSIT"
  | "PICKED_UP"
  | "DELIVERED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface PricingQuote {
  vehicleType: VehicleType;
  basePrice: number;
  distancePrice: number;
  surgeMultiplier: number;
  surgePrice: number;
  totalPrice: number;
  distance: number;
  estimatedTime: number;
  breakdown: {
    base: number;
    distanceCharge: number;
    surgeCharge: number;
    total: number;
  };
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PricingRequest {
  pickup: Coordinates;
  dropoff: Coordinates;
  vehicleType: VehicleType;
}

export interface ApiError {
  error: string;
  code: ErrorCode;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface JobCreateRequest {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  vehicleType: VehicleType;
  packageDetails?: string;
  notes?: string;
}

export interface UserSession {
  id: string;
  phone: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  name: string | null;
}
