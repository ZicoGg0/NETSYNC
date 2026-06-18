import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { ErrorCode } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Authentication required",
        "/api/notifications"
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const where: Record<string, unknown> = { userId: session.id };
    if (unreadOnly) where.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notificationEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notificationEvent.count({ where }),
      prisma.notificationEvent.count({
        where: { userId: session.id, read: false },
      }),
    ]);

    return createSuccessResponse({
      notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to fetch notifications",
      "/api/notifications"
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Authentication required",
        "/api/notifications"
      );
    }

    const body = await request.json();
    const { ids } = body as { ids?: string[] };

    if (ids && Array.isArray(ids)) {
      await prisma.notificationEvent.updateMany({
        where: { id: { in: ids }, userId: session.id },
        data: { read: true },
      });
    } else {
      await prisma.notificationEvent.updateMany({
        where: { userId: session.id, read: false },
        data: { read: true },
      });
    }

    return createSuccessResponse({ message: "Notifications marked as read" });
  } catch {
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to update notifications",
      "/api/notifications"
    );
  }
}
