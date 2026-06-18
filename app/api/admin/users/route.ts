import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { ErrorCode } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return createErrorResponse(
        ErrorCode.INVALID_ROLE,
        "Admin access required",
        "/api/admin/users"
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        include: {
          _count: { select: { customerJobs: true, providerJobs: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return createSuccessResponse({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to fetch users",
      "/api/admin/users"
    );
  }
}
