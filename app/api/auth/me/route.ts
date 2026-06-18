import { getSession } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { ErrorCode } from "@/types";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Not authenticated",
        "/api/auth/me"
      );
    }

    return createSuccessResponse({ user: session });
  } catch {
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Failed to get session",
      "/api/auth/me"
    );
  }
}
