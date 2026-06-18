import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { ErrorCode } from "@/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return createErrorResponse(
        ErrorCode.INVALID_ROLE,
        "Admin access required",
        "/api/admin/stats"
      );
    }

    const [
      totalUsers,
      totalJobs,
      activeJobs,
      completedJobs,
      totalRevenue,
      recentJobs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.job.count({
        where: {
          status: {
            in: [
              "PENDING",
              "ACCEPTED",
              "DRIVER_ASSIGNED",
              "DRIVER_ARRIVING",
              "IN_TRANSIT",
              "PICKED_UP",
            ],
          },
        },
      }),
      prisma.job.count({ where: { status: "COMPLETED" } }),
      prisma.job.aggregate({
        where: { status: "COMPLETED" },
        _sum: { totalPrice: true },
      }),
      prisma.job.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true, phone: true } },
          provider: { select: { name: true, phone: true } },
        },
      }),
    ]);

    return createSuccessResponse({
      totalUsers,
      totalJobs,
      activeJobs,
      completedJobs,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      recentJobs,
    });
  } catch {
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to fetch admin stats",
      "/api/admin/stats"
    );
  }
}
