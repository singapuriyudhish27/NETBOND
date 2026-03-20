import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectMongoDB from "@/lib/db/connection";
import UserModel from "@/lib/models/User/registerModel";
import { getAuthFromRequest } from "@/lib/middleware/auth";

export async function POST(request) {
  try {
    await connectMongoDB();

    const user = await getAuthFromRequest();
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const dbUser = await UserModel.findOne({ username: user.username });
    if (dbUser) {
      dbUser.logoutTime = new Date();
      await dbUser.save();
    }

    const cookieStore = await cookies();
    cookieStore.delete("uid");

    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { message: "Logout failed", error: error.message },
      { status: 500 }
    );
  }
}

