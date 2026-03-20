import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import PostModel from "@/lib/models/Post/postModel";
import ProfileModel from "@/lib/models/Profile/profileModel";
import { getAuthFromRequest } from "@/lib/middleware/auth";

export async function POST(request, { params }) {
  try {
    await connectMongoDB();

    const user = await getAuthFromRequest();
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { postId } = await params;
    const body = await request.json();
    const { caption, tags, location } = body;

    const post = await PostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "No Post Found" }, { status: 404 });
    }

    // Verify ownership
    const profile = await ProfileModel.findOne({ user: user._id });
    if (post.author.toString() !== profile._id.toString()) {
      return NextResponse.json(
        { error: "Unauthorized to edit this post" },
        { status: 403 }
      );
    }

    post.caption = caption || post.caption;
    post.tags = tags || post.tags;
    post.location = location || post.location;
    post.isEdited = true;

    await post.save();

    return NextResponse.json(
      { message: "Post updated successfully", post },
      { status: 200 }
    );
  } catch (error) {
    console.error("Edit Post Error:", error);
    return NextResponse.json(
      { error: "Failed To Edit Post", details: error.message },
      { status: 500 }
    );
  }
}

