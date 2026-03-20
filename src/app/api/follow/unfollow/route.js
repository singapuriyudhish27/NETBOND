import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import FollowModel from "@/lib/models/Follow/followModel";
import ProfileModel from "@/lib/models/Profile/profileModel";
import { getAuthFromRequest } from "@/lib/middleware/auth";

export async function POST(request) {
  try {
    await connectMongoDB();

    const user = await getAuthFromRequest();
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { followingId } = body;
    const followerId = user._id;

    const followRecord = await FollowModel.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    if (!followRecord) {
      return NextResponse.json(
        { message: "Not following this user" },
        { status: 400 }
      );
    }

    // Update Profile collections
    await ProfileModel.findOneAndUpdate(
      { user: followerId },
      { $pull: { following: followRecord._id } }
    );

    await ProfileModel.findOneAndUpdate(
      { user: followingId },
      { $pull: { followers: followRecord._id } }
    );

    return NextResponse.json(
      { message: "Successfully unfollowed the user" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unfollow Error:", error);
    return NextResponse.json(
      { message: "Failed to unfollow", error: error.message },
      { status: 500 }
    );
  }
}

