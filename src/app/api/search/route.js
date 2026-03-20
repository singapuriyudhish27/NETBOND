import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import ProfileModel from "@/lib/models/Profile/profileModel";
import PostModel from "@/lib/models/Post/postModel";

export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const query = body.q;

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search Users
    const users = await ProfileModel.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { full_name: { $regex: query, $options: "i" } },
      ],
    }).select("username full_name profile_picture");

    // Search Posts
    const posts = await PostModel.find({
      $or: [
        { caption: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    })
      .populate("author", "username")
      .select("caption tags media author createdAt")
      .limit(20);

    return NextResponse.json({ users, posts }, { status: 200 });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json(
      {
        users: [],
        posts: [],
        error: "Something Went Wrong",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

