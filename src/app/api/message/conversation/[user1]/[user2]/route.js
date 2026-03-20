import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import MessageModel from "@/lib/models/Message/messageModel";

export async function GET(request, { params }) {
  try {
    await connectMongoDB();

    const { user1, user2 } = await params;

    const messages = await MessageModel.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("sender", "username profile_picture")
      .populate("receiver", "username profile_picture");

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Get Conversation Error:", error);
    return NextResponse.json(
      { error: "Failed To Fetch Message", details: error.message },
      { status: 500 }
    );
  }
}

