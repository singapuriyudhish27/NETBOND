import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
      required: true,
    },
    profile_picture: {
      type: String,
      default: "https://example.com/default-profile.png",
      required: false,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "follow",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "follow",
      },
    ],
    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "private"],
        default: "public",
      },
      messagePermission: {
        type: String,
        enum: ["everyone", "followers"],
        default: "everyone",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ProfileModel =
  mongoose.models.userprofile || mongoose.model("userprofile", profileSchema);

export default ProfileModel;

