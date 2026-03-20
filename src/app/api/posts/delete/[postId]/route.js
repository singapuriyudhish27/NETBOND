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

    const post = await PostModel.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: "Post Not Found To Delete" },
        { status: 404 }
      );
    }

    // Verify ownership
    const profile = await ProfileModel.findOne({ user: user._id });
    if (post.author.toString() !== profile._id.toString()) {
      return NextResponse.json(
        { error: "Unauthorized to delete this post" },
        { status: 403 }
      );
    }

    await PostModel.findByIdAndDelete(postId);

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Post Error:", error);
    return NextResponse.json(
      { error: "Failed To Delete Post", details: error.message },
      { status: 500 }
    );
  }
}

