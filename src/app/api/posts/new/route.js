import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/connection";
import PostModel from "@/lib/models/Post/postModel";
import ProfileModel from "@/lib/models/Profile/profileModel";
import { getAuthFromRequest } from "@/lib/middleware/auth";
import { saveFile } from "@/lib/utils/fileUpload";

export async function POST(request) {
  try {
    await connectMongoDB();

    const user = await getAuthFromRequest();
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const caption = formData.get("caption");
    const tags = formData.get("tags");
    const location = formData.get("location");
    const mediaType = formData.get("mediaType");
    const file = formData.get("media");

    if (!file) {
      return NextResponse.json(
        { error: "No Media File Uploaded" },
        { status: 400 }
      );
    }

    const profile = await ProfileModel.findOne({ user: user._id });
    if (!profile) {
      return NextResponse.json(
        { error: "Profile Not Found" },
        { status: 404 }
      );
    }

    // Handle file upload
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;
    const mediaUrl = await saveFile(fileBuffer, fileName, "UploadPost");

    // Map file type to valid enum values
    const getContentType = (fileType, fileName, mediaType) => {
      // If file.type is valid, use it
      const validContentTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/ogg",
      ];

      if (validContentTypes.includes(fileType)) {
        return fileType;
      }

      // Fallback: determine from file extension
      const extension = fileName.split(".").pop()?.toLowerCase();
      const type = mediaType || (fileType.startsWith("image/") ? "image" : "video");

      if (type === "image") {
        if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
        if (extension === "png") return "image/png";
        if (extension === "webp") return "image/webp";
        // Default to jpeg for images
        return "image/jpeg";
      } else if (type === "video") {
        if (extension === "mp4") return "video/mp4";
        if (extension === "webm") return "video/webm";
        if (extension === "ogg") return "video/ogg";
        // Default to mp4 for videos
        return "video/mp4";
      }

      // Final fallback
      return "image/jpeg";
    };

    const contentType = getContentType(file.type, file.name, mediaType);
    // Determine media type from contentType
    const determinedType = contentType.startsWith("image/") ? "image" : "video";
    const media = {
      url: mediaUrl,
      type: mediaType || determinedType,
      contentType: contentType,
      originalName: file.name,
    };

    const newPost = new PostModel({
      author: profile._id,
      media,
      caption,
      tags: tags ? tags.split(",") : [],
      location,
    });

    await newPost.save();

    return NextResponse.json(
      { message: "Post created successfully", post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error("Post Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create post", details: error.message },
      { status: 500 }
    );
  }
}

