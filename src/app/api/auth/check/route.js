import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/middleware/auth";

export async function GET(request) {
  try {
    const user = await getAuthFromRequest();
    
    if (!user || !user._id) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json(
      { 
        authenticated: true, 
        user: {
          _id: user._id?.toString() || user._id,
          username: user.username,
          email_id: user.email_id,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}

