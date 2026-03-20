import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import MessageModel from "@/lib/models/Message/messageModel";
import UserModel from "@/lib/models/User/registerModel";

export async function GET(request, { params }) {
  try {
    await connectMongoDB();

    const { userId } = await params;

    const sentMessages = await MessageModel.find({ sender: userId }).select(
      "receiver"
    );
    const receivedMessages = await MessageModel.find({ receiver: userId }).select(
      "sender"
    );

    const users = new Set();

    sentMessages.forEach((msg) => users.add(msg.receiver.toString()));
    receivedMessages.forEach((msg) => users.add(msg.sender.toString()));

    const chatUsers = await UserModel.find({
      _id: { $in: Array.from(users) },
    }).select("username email_id");

    return NextResponse.json(chatUsers, { status: 200 });
  } catch (error) {
    console.error("Get User Chats Error:", error);
    return NextResponse.json(
      { error: "Failed To fetch User Chats", details: error.message },
      { status: 500 }
    );
  }
}

