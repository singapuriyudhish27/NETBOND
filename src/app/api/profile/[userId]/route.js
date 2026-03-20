import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import ProfileModel from "@/lib/models/Profile/profileModel";
import PostModel from "@/lib/models/Post/postModel";
import UserModel from "@/lib/models/User/registerModel";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectMongoDB();

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if userId is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);
    
    // Build query: search by username, profile _id, or user field
    const query = isValidObjectId
      ? {
          $or: [
            { username: userId },
            { _id: new mongoose.Types.ObjectId(userId) },
            { user: new mongoose.Types.ObjectId(userId) }
          ]
        }
      : { username: userId };

    const profile = await ProfileModel.findOne(query)
      .populate("user", "email_id username")
      .select("-__v");

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // Get posts by this user
    const posts = await PostModel.find({ author: profile._id })
      .sort({ createdAt: -1 })
      .populate("author", "username full_name profile_picture")
      .select("-__v");

    return NextResponse.json(
      { profile, posts },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Profile Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error.message },
      { status: 500 }
    );
  }
}