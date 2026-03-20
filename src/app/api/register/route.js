import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import UserModel from "@/lib/models/User/registerModel";

export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { full_name, mobile_number, email_id, username, password } = body;

    if (!full_name || !mobile_number || !email_id || !username || !password) {
      return NextResponse.json(
        { message: "Missing Fields" },
        { status: 400 }
      );
    }

    const userCreate = await UserModel.create({
      full_name,
      mobile_number,
      email_id,
      username,
      password,
    });

    if (!userCreate) {
      return NextResponse.json(
        { message: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User created successfully", user: userCreate },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Registration failed", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "emailVerification") {
    return NextResponse.json({ message: "Sending Verification Email" });
  }

  if (type === "numberVerification") {
    return NextResponse.json({ message: "Sending Verification Message" });
  }

  return NextResponse.json({ message: "Invalid request" }, { status: 400 });
}

