import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import NotificationModel from "@/lib/models/Notification/notificationModel";

export async function GET(request, { params }) {
  try {
    await connectMongoDB();

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "UserId Is Required" }, { status: 400 });
    }

    const notifications = await NotificationModel.find({ receiver: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "username profile_picture")
      .populate("receiver", "username profile_picture")
      .populate("post", "caption media");

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Get Notification Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: error.message },
      { status: 500 }
    );
  }
}

