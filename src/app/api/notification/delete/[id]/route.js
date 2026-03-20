import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import NotificationModel from "@/lib/models/Notification/notificationModel";

export async function DELETE(request, { params }) {
  try {
    await connectMongoDB();

    const { id } = await params;

    const deleted = await NotificationModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Notification Not Found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Notification Deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return NextResponse.json(
      { error: "Failed to delete notification", details: error.message },
      { status: 500 }
    );
  }
}

