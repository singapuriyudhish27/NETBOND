import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import GoogleUserModel from "@/lib/models/User/loginModel";

export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { id, displayName, familyName, givenName, emails, email_verified, photos, provider, _json, accessToken } = body;

    await GoogleUserModel.create({
      id,
      displayName,
      familyName,
      givenName,
      emails,
      verified: email_verified,
      photos,
      provider,
      _json,
      accessToken,
    });

    return NextResponse.json({ status: "Successful" }, { status: 200 });
  } catch (error) {
    console.error("Google User Creation Error:", error);
    return NextResponse.json(
      { message: "Failed to create Google user", error: error.message },
      { status: 500 }
    );
  }
}

