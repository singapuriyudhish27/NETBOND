import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import FollowModel from "@/lib/models/Follow/followModel";

export async function GET(request, { params }) {
  try {
    await connectMongoDB();

    const { userId } = await params;

    const followers = await FollowModel.find({ following: userId })
      .populate("follower", "username profile_picture")
      .sort({ createdAt: -1 });

    return NextResponse.json(followers, { status: 200 });
  } catch (error) {
    console.error("Get Followers Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch followers", error: error.message },
      { status: 500 }
    );
  }
}

