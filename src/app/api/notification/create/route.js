import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import NotificationModel from "@/lib/models/Notification/notificationModel";

export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { receiver, sender, type, post, comment } = body;

    if (!receiver || !sender || !type) {
      return NextResponse.json(
        { error: "Notification Requirements Missing" },
        { status: 400 }
      );
    }

    const notification = new NotificationModel({
      receiver,
      sender,
      type,
      post: post || null,
      comment: comment || "",
    });

    await notification.save();

    return NextResponse.json(
      { message: "Notification Created", notification },
      { status: 201 }
    );
  } catch (error) {
    console.error("Notification Creation Error:", error);
    return NextResponse.json(
      { error: "Notification Failed", details: error.message },
      { status: 500 }
    );
  }
}

