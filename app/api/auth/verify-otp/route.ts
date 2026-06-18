import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizePhone, isValidNigerianPhone } from "@/lib/termii";
import { generateToken, setAuthCookie, maskPhone } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { ErrorCode } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, role } = body;

    if (!phone || typeof phone !== "string") {
      return createErrorResponse(
        ErrorCode.PHONE_REQUIRED,
        "Phone number is required",
        "/api/auth/verify-otp"
      );
    }

    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
      return createErrorResponse(
        ErrorCode.INVALID_OTP,
        "Invalid OTP format. Must be exactly 6 digits.",
        "/api/auth/verify-otp"
      );
    }

    const cleaned = phone.trim();

    if (!isValidNigerianPhone(cleaned)) {
      return createErrorResponse(
        ErrorCode.INVALID_PHONE,
        "Invalid Nigerian phone number format",
        "/api/auth/verify-otp"
      );
    }

    const validRole = role && ["CUSTOMER", "PROVIDER", "ADMIN"].includes(role)
      ? (role as "CUSTOMER" | "PROVIDER" | "ADMIN")
      : "CUSTOMER";

    const normalized = normalizePhone(cleaned);

    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone: normalized,
        code: code.trim(),
        verified: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return createErrorResponse(
        ErrorCode.INVALID_OTP,
        "Invalid OTP code. Please try again.",
        "/api/auth/verify-otp"
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      return createErrorResponse(
        ErrorCode.OTP_EXPIRED,
        "OTP has expired. Please request a new one.",
        "/api/auth/verify-otp"
      );
    }

    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    let user = await prisma.user.findUnique({
      where: { phone: normalized },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: normalized,
          role: validRole,
        },
      });
    }

    const token = generateToken(user);
    const cookie = setAuthCookie(token);

    const response = createSuccessResponse({
      message: "Authentication successful",
      user: {
        id: user.id,
        phone: maskPhone(user.phone),
        role: user.role,
        name: user.name,
      },
    });

    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<NextResponse["cookies"]["set"]>[2]);

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      process.env.NODE_ENV === "development"
        ? message
        : "Something went wrong. Please try again.",
      "/api/auth/verify-otp"
    );
  }
}
