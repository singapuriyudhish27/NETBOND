import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectMongoDB from "@/lib/db/connection";
import UserModel from "@/lib/models/User/registerModel";
import GoogleUserModel from "@/lib/models/User/loginModel";
import ProfileModel from "@/lib/models/Profile/profileModel";
import { setUser } from "@/lib/services/authJWTUser";

export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { email_id, username, password } = body;

    if (!email_id || !username || !password) {
      return NextResponse.json({ message: "Missing Fields" }, { status: 400 });
    }

    const userData = await UserModel.findOne({
      email_id,
      username,
      password,
    });

    if (!userData) {
      return NextResponse.json(
        { message: "User Not Found, Kindly Register First" },
        { status: 404 }
      );
    }

    userData.loginTime = new Date();
    await userData.save();

    const token = setUser(userData);
    const cookieStore = await cookies();
    cookieStore.set("uid", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    const profile = await ProfileModel.findOne({ username });
    
    // Always return user object, even if profile doesn't exist
    const userResponse = {
      _id: userData._id?.toString() || userData._id,
      username: userData.username,
      email_id: userData.email_id,
    };

    if (!profile) {
      return NextResponse.json(
        { 
          message: "Profile not found, please create profile", 
          needsProfile: true,
          user: userResponse,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Login successful",
        user: userResponse,
        hasProfile: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Login failed", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const emails = searchParams.get("emails");

    if (!emails) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const user_Data = await GoogleUserModel.findOne({ emails });

    if (!user_Data) {
      return NextResponse.json(
        { message: "User not found, please register" },
        { status: 404 }
      );
    }

    return NextResponse.json(user_Data, { status: 200 });
  } catch (error) {
    console.error("Google Profile Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

