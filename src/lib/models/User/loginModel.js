import mongoose from "mongoose";

const googleUserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    familyName: {
      type: String,
      required: true,
    },
    givenName: {
      type: String,
      required: true,
    },
    emails: {
      type: String,
      required: true,
      unique: true,
    },
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
    photos: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    _json: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const GoogleUserModel =
  mongoose.models.GoogleUser || mongoose.model("GoogleUser", googleUserSchema);

export default GoogleUserModel;

