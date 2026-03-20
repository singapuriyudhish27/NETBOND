import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import ProfileModel from "@/lib/models/Profile/profileModel";
import UserModel from "@/lib/models/User/registerModel";
import PostModel from "@/lib/models/Post/postModel";
import FollowModel from "@/lib/models/Follow/followModel";
import { getAuthFromRequest } from "@/lib/middleware/auth";
import { saveFile, deleteFile } from "@/lib/utils/fileUpload";

export async function POST(request) {
  try {
    await connectMongoDB();

    const formData = await request.formData();
    const username = formData.get("username");
    const full_name = formData.get("full_name");
    const bio = formData.get("bio");
    const website = formData.get("website");
    const location = formData.get("location");
    const gender = formData.get("gender");
    const privacy = formData.get("privacy");

    // Files from form data
    const profile_picture = formData.get("profile_picture");

    if (!username || !full_name) {
      return NextResponse.json(
        { message: "Some Fields Are Missing" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }

    const existUser = await ProfileModel.findOne({ username });
    if (existUser) {
      return NextResponse.json(
        { message: "Profile Already Exists" },
        { status: 400 }
      );
    }

    // Handle file uploads
    let profilePictureUrl = "";

    if (profile_picture && profile_picture instanceof File) {
      const fileBuffer = await profile_picture.arrayBuffer();
      const fileName = `${Date.now()}-${profile_picture.name}`;
      profilePictureUrl = await saveFile(fileBuffer, fileName, "Uploads");
    }

    // Create Profile
    const newProfile = new ProfileModel({
      user: user._id,
      username,
      full_name,
      bio: bio || "",
      website: website || "",
      location: location || "",
      gender: gender || "other",
      profile_picture: profilePictureUrl || "https://example.com/default-profile.png",
      privacy: {
        profileVisibility: privacy === "private" ? "private" : "public",
        messagePermission: "everyone",
      },
    });

    await newProfile.save();

    return NextResponse.json(
      { message: "Profile created successfully", profile: newProfile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error Creating Profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectMongoDB();

    const user = await getAuthFromRequest();
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const username = user.username;

    const profile = await ProfileModel.findOne({ username })
      .populate("user", "email_id username");
    
    // Get followers and following counts/ids separately if needed
    // Note: followers and following arrays store follow document IDs, not user/profile IDs
    // If you need actual follower/following user data, query FollowModel separately

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found, please create profile" },
        { status: 404 }
      );
    }

    const posts = await PostModel.find({ author: profile._id })
      .sort({ createdAt: -1 })
      .populate("author", "username profile_picture");

    return NextResponse.json({ profile, posts }, { status: 200 });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return NextResponse.json(
      { error: "Failed To Fetch Profile", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectMongoDB();

    const user = await getAuthFromRequest();
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const username = user.username; // Use authenticated user's username
    
    // Find existing profile
    const existingProfile = await ProfileModel.findOne({ username });
    if (!existingProfile) {
      return NextResponse.json(
        { message: "Profile not found. Please create a profile first." },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData = {};

    // Text fields
    const full_name = formData.get("full_name");
    const bio = formData.get("bio");
    const website = formData.get("website");
    const location = formData.get("location");
    const gender = formData.get("gender");
    const privacy = formData.get("privacy");

    if (full_name) updateData.full_name = full_name;
    if (bio !== null) updateData.bio = bio || "";
    if (website !== null) updateData.website = website || "";
    if (location) updateData.location = location;
    if (gender) updateData.gender = gender;

    // Handle privacy
    if (privacy) {
      updateData.privacy = {
        profileVisibility: privacy === "private" ? "private" : "public",
        messagePermission: existingProfile.privacy?.messagePermission || "everyone",
      };
    }

    // Handle file uploads
    const profile_picture = formData.get("profile_picture");

    if (profile_picture && profile_picture instanceof File) {
      // Delete old profile picture if exists
      if (existingProfile.profile_picture) {
        await deleteFile(existingProfile.profile_picture);
      }
      
      // Save new profile picture
      const fileBuffer = await profile_picture.arrayBuffer();
      const fileName = `${Date.now()}-${profile_picture.name}`;
      updateData.profile_picture = await saveFile(fileBuffer, fileName, "Uploads");
    }

    // Update profile
    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { username },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { message: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Profile updated successfully", 
        profile: updatedProfile 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile", details: error.message },
      { status: 500 }
    );
  }
}

