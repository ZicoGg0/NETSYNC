import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { isValidNigerianPhone, normalizePhone, sendOtp } from "@/lib/termii";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { maskPhone } from "@/lib/auth";
import { ErrorCode } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, role } = body;

    if (!phone || typeof phone !== "string") {
      return createErrorResponse(
        ErrorCode.PHONE_REQUIRED,
        "Phone number is required",
        "/api/auth/send-otp"
      );
    }

    const cleaned = phone.trim();

    if (!isValidNigerianPhone(cleaned)) {
      return createErrorResponse(
        ErrorCode.INVALID_PHONE,
        "Invalid Nigerian phone number format. Use: +234XXXXXXXXXX or 0XXXXXXXXXX",
        "/api/auth/send-otp"
      );
    }

    if (role && !["CUSTOMER", "PROVIDER", "ADMIN"].includes(role)) {
      return createErrorResponse(
        ErrorCode.INVALID_ROLE,
        "Invalid role. Must be CUSTOMER, PROVIDER, or ADMIN",
        "/api/auth/send-otp"
      );
    }

    const normalized = normalizePhone(cleaned);

    const result = await sendOtp(normalized);

    if (!result.success) {
      return createErrorResponse(
        ErrorCode.OTP_SEND_FAILED,
        "Failed to send OTP. Please try again.",
        "/api/auth/send-otp"
      );
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const existingUser = await prisma.user.findUnique({
      where: { phone: normalized },
    });

    await prisma.otp.create({
      data: {
        phone: normalized,
        code: result.code,
        expiresAt,
        userId: existingUser?.id,
      },
    });

    const responseData: Record<string, string> = {
      message: "OTP sent successfully",
      phone: maskPhone(normalized),
    };

    if (process.env.NODE_ENV === "development") {
      responseData.devOtp = result.code;
    }

    return createSuccessResponse(responseData);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      process.env.NODE_ENV === "development"
        ? message
        : "Something went wrong. Please try again.",
      "/api/auth/send-otp"
    );
  }
}
