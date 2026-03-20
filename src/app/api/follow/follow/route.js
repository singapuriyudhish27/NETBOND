import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import FollowModel from "@/lib/models/Follow/followModel";
import ProfileModel from "@/lib/models/Profile/profileModel";
import NotificationModel from "@/lib/models/Notification/notificationModel";
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

    if (followerId === followingId) {
      return NextResponse.json(
        { message: "You Can Not Follow Yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await FollowModel.findOne({
      follower: followerId,
      following: followingId,
    });

    if (existingFollow) {
      return NextResponse.json(
        { message: "Already Following This User" },
        { status: 400 }
      );
    }

    // Save in Follow Model
    const newFollow = await FollowModel.create({
      follower: followerId,
      following: followingId,
    });

    // Update Profile collections
    await ProfileModel.findOneAndUpdate(
      { user: followerId },
      { $addToSet: { following: newFollow._id } }
    );

    await ProfileModel.findOneAndUpdate(
      { user: followingId },
      { $addToSet: { followers: newFollow._id } }
    );

    // Create notification for the user being followed
    try {
      // Check if notification already exists to avoid duplicates
      const existingNotification = await NotificationModel.findOne({
        sender: followerId,
        receiver: followingId,
        type: "following",
      });

      if (!existingNotification) {
        await NotificationModel.create({
          sender: followerId,
          receiver: followingId,
          type: "following",
        });
      }
    } catch (notifError) {
      // Don't fail the follow request if notification creation fails
      console.error("Error creating follow notification:", notifError);
    }

    return NextResponse.json(
      { message: "Successfully Followed The User", data: newFollow },
      { status: 200 }
    );
  } catch (error) {
    console.error("Follow Error:", error);
    return NextResponse.json(
      { message: "Failed To Follow", error: error.message },
      { status: 500 }
    );
  }
}

