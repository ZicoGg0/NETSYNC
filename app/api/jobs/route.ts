import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  calculatePricing,
  validateCoordinates,
  isWithinServiceArea,
} from "@/lib/pricing";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { ErrorCode } from "@/types";
import type { VehicleType } from "@/types";

const VALID_VEHICLES: VehicleType[] = ["BIKE", "VAN", "TRUCK", "HAULAGE"];

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Authentication required",
        "/api/jobs"
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const where: Record<string, unknown> = {};

    if (session.role === "CUSTOMER") {
      where.customerId = session.id;
    } else if (session.role === "PROVIDER") {
      where.providerId = session.id;
    }

    if (status) {
      where.status = status;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          provider: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return createSuccessResponse({
      jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to fetch jobs",
      "/api/jobs"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Authentication required",
        "/api/jobs"
      );
    }

    if (session.role !== "CUSTOMER") {
      return createErrorResponse(
        ErrorCode.INVALID_ROLE,
        "Only customers can create jobs",
        "/api/jobs"
      );
    }

    const body = await request.json();
    const {
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      vehicleType,
      packageDetails,
      notes,
    } = body;

    if (
      !pickupAddress ||
      !dropoffAddress ||
      pickupLat == null ||
      pickupLng == null ||
      dropoffLat == null ||
      dropoffLng == null ||
      !vehicleType
    ) {
      return createErrorResponse(
        ErrorCode.MISSING_FIELDS,
        "All address fields, coordinates, and vehicle type are required",
        "/api/jobs"
      );
    }

    const pickup = { lat: Number(pickupLat), lng: Number(pickupLng) };
    const dropoff = { lat: Number(dropoffLat), lng: Number(dropoffLng) };

    if (!validateCoordinates(pickup) || !validateCoordinates(dropoff)) {
      return createErrorResponse(
        ErrorCode.INVALID_COORDINATES,
        "Invalid coordinate values",
        "/api/jobs"
      );
    }

    if (!isWithinServiceArea(pickup) || !isWithinServiceArea(dropoff)) {
      return createErrorResponse(
        ErrorCode.LOCATION_OUT_OF_SERVICE,
        "Location is outside our Lagos service area",
        "/api/jobs"
      );
    }

    if (!VALID_VEHICLES.includes(vehicleType as VehicleType)) {
      return createErrorResponse(
        ErrorCode.INVALID_VEHICLE_TYPE,
        `Invalid vehicle type. Must be one of: ${VALID_VEHICLES.join(", ")}`,
        "/api/jobs"
      );
    }

    const pricing = calculatePricing(pickup, dropoff, vehicleType as VehicleType);

    const job = await prisma.job.create({
      data: {
        pickupAddress: pickupAddress.trim(),
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropoffAddress: dropoffAddress.trim(),
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        vehicleType: vehicleType as VehicleType,
        distance: pricing.distance,
        basePrice: pricing.basePrice,
        distancePrice: pricing.distancePrice,
        surgeMultiplier: pricing.surgeMultiplier,
        surgePrice: pricing.surgePrice,
        totalPrice: pricing.totalPrice,
        estimatedTime: pricing.estimatedTime,
        packageDetails: packageDetails?.trim() || null,
        notes: notes?.trim() || null,
        customerId: session.id,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
    });

    await prisma.notificationEvent.create({
      data: {
        type: "JOB_CREATED",
        title: "Job Created",
        message: `Your delivery from ${pickupAddress} has been created. Estimated price: ₦${pricing.totalPrice.toLocaleString()}`,
        userId: session.id,
        jobId: job.id,
      },
    });

    return createSuccessResponse(job, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create job";
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      process.env.NODE_ENV === "development"
        ? message
        : "Failed to create job",
      "/api/jobs"
    );
  }
}
