import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { ErrorCode } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Authentication required",
        "/api/jobs/[id]"
      );
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, name: true, phone: true } },
        locationHistory: { orderBy: { timestamp: "desc" }, take: 20 },
        notifications: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!job) {
      return createErrorResponse(
        ErrorCode.JOB_NOT_FOUND,
        "Job not found",
        "/api/jobs/[id]"
      );
    }

    if (
      session.role === "CUSTOMER" &&
      job.customerId !== session.id
    ) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "You do not have access to this job",
        "/api/jobs/[id]"
      );
    }

    if (
      session.role === "PROVIDER" &&
      job.providerId !== session.id
    ) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "You do not have access to this job",
        "/api/jobs/[id]"
      );
    }

    return createSuccessResponse(job);
  } catch {
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to fetch job",
      "/api/jobs/[id]"
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Authentication required",
        "/api/jobs/[id]"
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) {
      return createErrorResponse(
        ErrorCode.JOB_NOT_FOUND,
        "Job not found",
        "/api/jobs/[id]"
      );
    }

    const updateData: Record<string, unknown> = {};

    if (status === "CANCELLED") {
      const cancellableStatuses = ["PENDING", "QUOTE_SENT", "ACCEPTED"];
      if (!cancellableStatuses.includes(job.status)) {
        return createErrorResponse(
          ErrorCode.JOB_CANNOT_CANCEL,
          "This job can no longer be cancelled",
          "/api/jobs/[id]"
        );
      }
      updateData.status = "CANCELLED";
    } else if (status === "ACCEPTED" && session.role === "PROVIDER") {
      if (job.status !== "PENDING") {
        return createErrorResponse(
          ErrorCode.JOB_ALREADY_ACCEPTED,
          "This job has already been accepted",
          "/api/jobs/[id]"
        );
      }
      updateData.status = "ACCEPTED";
      updateData.providerId = session.id;
    } else if (session.role === "PROVIDER" || session.role === "ADMIN") {
      const validTransitions: Record<string, string[]> = {
        ACCEPTED: ["DRIVER_ASSIGNED", "DRIVER_ARRIVING", "CANCELLED"],
        DRIVER_ASSIGNED: ["DRIVER_ARRIVING", "CANCELLED"],
        DRIVER_ARRIVING: ["IN_TRANSIT", "PICKED_UP", "CANCELLED"],
        IN_TRANSIT: ["PICKED_UP"],
        PICKED_UP: ["DELIVERED"],
        DELIVERED: ["COMPLETED"],
      };

      const allowed = validTransitions[job.status];
      if (!allowed || !allowed.includes(status)) {
        return createErrorResponse(
          ErrorCode.INVALID_STATUS,
          `Cannot transition from ${job.status} to ${status}`,
          "/api/jobs/[id]"
        );
      }

      updateData.status = status;
      if (status === "PICKED_UP") updateData.pickupTime = new Date();
      if (status === "DELIVERED") updateData.dropoffTime = new Date();
      if (status === "COMPLETED") updateData.deliveredAt = new Date();
    } else {
      return createErrorResponse(
        ErrorCode.INVALID_ROLE,
        "You cannot update this job",
        "/api/jobs/[id]"
      );
    }

    const updated = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, name: true, phone: true } },
      },
    });

    await prisma.notificationEvent.create({
      data: {
        type: status === "CANCELLED" ? "CANCELLED" : "JOB_ACCEPTED",
        title: `Job ${status.toLowerCase().replace("_", " ")}`,
        message: `Your delivery status has been updated to: ${status}`,
        userId: job.customerId,
        jobId: job.id,
      },
    });

    return createSuccessResponse(updated);
  } catch {
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to update job",
      "/api/jobs/[id]"
    );
  }
}
