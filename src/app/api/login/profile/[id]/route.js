import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import GoogleUserModel from "@/lib/models/User/loginModel";

export async function PATCH(request, { params }) {
  try {
    await connectMongoDB();

    const { id } = await params;
    const body = await request.json();

    const updatedUser = await GoogleUserModel.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json(
      { message: "Failed to update user", error: error.message },
      { status: 500 }
    );
  }
}

