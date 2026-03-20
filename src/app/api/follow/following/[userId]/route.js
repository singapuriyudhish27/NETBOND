import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import FollowModel from "@/lib/models/Follow/followModel";

export async function GET(request, { params }) {
  try {
    await connectMongoDB();

    const { userId } = await params;

    const following = await FollowModel.find({ follower: userId })
      .populate("following", "username profile_picture")
      .sort({ createdAt: -1 });

    return NextResponse.json(following, { status: 200 });
  } catch (error) {
    console.error("Get Following Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch following", error: error.message },
      { status: 500 }
    );
  }
}

