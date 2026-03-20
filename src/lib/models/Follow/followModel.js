import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
      required: true,
    },
  },
  { timestamps: true }
);

const FollowModel = mongoose.models.follow || mongoose.model("follow", followSchema);

export default FollowModel;

