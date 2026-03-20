import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import ProfileModel from "@/lib/models/Profile/profileModel";

export async function GET(request, { params }) {
  try {
    await connectMongoDB();

    const { _id } = await params;

    const searchedProfile = await ProfileModel.findById(_id)
      .populate("user", "email_id username")
      .populate("followers", "username profile_picture")
      .populate("following", "username profile_picture");

    if (!searchedProfile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ searchedProfile }, { status: 200 });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return NextResponse.json(
      { error: "Failed To Fetch Profile", details: error.message },
      { status: 500 }
    );
  }
}

