import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "following", "mention", "message", "unfollowing", "share", "story"],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      default: null,
    },
    comment: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const NotificationModel =
  mongoose.models.notification || mongoose.model("notification", notificationSchema);

export default NotificationModel;

