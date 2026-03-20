import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import PostModel from "@/lib/models/Post/postModel";

export async function GET(request) {
  try {
    await connectMongoDB();

    const posts = await PostModel.find()
      .populate("author", "username full_name profile_picture")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Fetch All Posts Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch posts",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

