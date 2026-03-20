import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import PostModel from "@/lib/models/Post/postModel";
import ProfileModel from "@/lib/models/Profile/profileModel";
import NotificationModel from "@/lib/models/Notification/notificationModel";
import { getAuthFromRequest } from "@/lib/middleware/auth";

export async function POST(request, { params }) {
  try {
    await connectMongoDB();

    const user = await getAuthFromRequest();
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { postId } = await params;
    const userId = user._id;

    const post = await PostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isLiked = post.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );

    if (isLiked) {
      post.likes = post.likes.filter(
        (likeId) => likeId.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
      
      // Create notification for post author when someone likes their post
      try {
        const postAuthorProfile = await ProfileModel.findById(post.author);
        if (postAuthorProfile && postAuthorProfile.user.toString() !== userId.toString()) {
          // Check if notification already exists to avoid duplicates
          const existingNotification = await NotificationModel.findOne({
            sender: userId,
            receiver: postAuthorProfile.user,
            type: "like",
            post: postId,
          });

          if (!existingNotification) {
            await NotificationModel.create({
              sender: userId,
              receiver: postAuthorProfile.user,
              type: "like",
              post: postId,
            });
          }
        }
      } catch (notifError) {
        // Don't fail the like request if notification creation fails
        console.error("Error creating like notification:", notifError);
      }
    }

    await post.save();

    return NextResponse.json(
      {
        success: true,
        liked: !isLiked,
        likesCount: post.likes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Toggle Like Error:", error);
    return NextResponse.json(
      {
        error: "Failed to toggle like",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

