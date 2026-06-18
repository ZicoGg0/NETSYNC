import { NextResponse } from "next/server";
import { ErrorCode } from "@/types";

const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.PHONE_REQUIRED]: 400,
  [ErrorCode.INVALID_PHONE]: 400,
  [ErrorCode.OTP_SEND_FAILED]: 500,
  [ErrorCode.MISSING_FIELDS]: 400,
  [ErrorCode.INVALID_COORDINATES]: 400,
  [ErrorCode.INVALID_VEHICLE_TYPE]: 400,
  [ErrorCode.INVALID_STATUS]: 400,

  [ErrorCode.INVALID_OTP]: 401,
  [ErrorCode.OTP_EXPIRED]: 401,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.INVALID_ROLE]: 403,

  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.JOB_NOT_FOUND]: 404,

  [ErrorCode.DUPLICATE_PHONE]: 409,

  [ErrorCode.PROVIDER_UNAVAILABLE]: 422,
  [ErrorCode.LOCATION_OUT_OF_SERVICE]: 422,
  [ErrorCode.JOB_ALREADY_ACCEPTED]: 422,
  [ErrorCode.JOB_CANNOT_CANCEL]: 422,

  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.OTP_SERVICE_ERROR]: 500,
  [ErrorCode.PRICING_ERROR]: 500,
};

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  path?: string
): NextResponse {
  const statusCode = ERROR_STATUS_MAP[code] || 500;
  return NextResponse.json(
    {
      error: message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
      path,
    },
    { status: statusCode }
  );
}

export function createSuccessResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}
