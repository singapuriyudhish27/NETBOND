import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import MessageModel from "@/lib/models/Message/messageModel";
import { getAuthFromRequest } from "@/lib/middleware/auth";

export async function POST(request) {
  try {
    await connectMongoDB();

    const user = await getAuthFromRequest();
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, content } = body;
    const senderId = user._id;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: "All Fields Are Required" },
        { status: 400 }
      );
    }

    const newMessage = new MessageModel({
      sender: senderId,
      receiver: receiverId,
      messsage: content,
    });

    await newMessage.save();

    return NextResponse.json(
      { message: "Message Sent Successfully", data: newMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send Message Error:", error);
    return NextResponse.json(
      { error: "Failed To Send Message", details: error.message },
      { status: 500 }
    );
  }
}

