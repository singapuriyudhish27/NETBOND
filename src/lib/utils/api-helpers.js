/**
 * Helper functions for API routes
 */
import { NextResponse } from "next/server";

export function createErrorResponse(message, status = 500, details = null) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

export function createSuccessResponse(data, message = null, status = 200) {
  return NextResponse.json(
    {
      ...(message && { message }),
      ...data,
    },
    { status }
  );
}

