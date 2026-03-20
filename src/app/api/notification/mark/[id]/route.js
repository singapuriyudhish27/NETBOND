import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import NotificationModel from "@/lib/models/Notification/notificationModel";

export async function PUT(request, { params }) {
  try {
    await connectMongoDB();

    const { id } = await params;

    const updated = await NotificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Notification Not Found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Marked As Read", notification: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mark As Read Error:", error);
    return NextResponse.json(
      { error: "Failed to mark as read", details: error.message },
      { status: 500 }
    );
  }
}

