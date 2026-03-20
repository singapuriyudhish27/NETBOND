import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import NotificationModel from "@/lib/models/Notification/notificationModel";
import ProfileModel from "@/lib/models/Profile/profileModel";
import { getAuthFromRequest } from "@/lib/middleware/auth";

export async function GET(request) {
  try {
    await connectMongoDB();

    const user = await getAuthFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const notifications = await NotificationModel.find({ receiver: user._id })
      .sort({ createdAt: -1 })
      .populate("sender", "username email_id")
      .populate("receiver", "username email_id")
      .populate("post", "caption media");

    // Enrich notifications with profile information for sender
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notif) => {
        const notifObj = notif.toObject();
        if (notifObj.sender) {
          const senderProfile = await ProfileModel.findOne({ user: notifObj.sender._id });
          if (senderProfile) {
            notifObj.sender.profile_picture = senderProfile.profile_picture;
            notifObj.sender.username = senderProfile.username || notifObj.sender.username;
          }
        }
        return notifObj;
      })
    );

    return NextResponse.json(enrichedNotifications, { status: 200 });
  } catch (error) {
    console.error("Get Notification Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: error.message },
      { status: 500 }
    );
  }
}

