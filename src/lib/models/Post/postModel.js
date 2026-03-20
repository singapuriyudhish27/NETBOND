import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userprofile",
      required: true,
    },
    caption: {
      type: String,
      maxlength: 1000,
    },
    media: {
      url: {
        type: String,
        required: true,
      },
      contentType: {
        type: String,
        enum: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "video/mp4",
          "video/webm",
          "video/ogg",
        ],
        required: true,
      },
      type: {
        type: String,
        enum: ["image", "video"],
        required: true,
      },
      originalName: {
        type: String,
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "register",
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

postSchema.virtual("authorProfile", {
  ref: "userprofile",
  localField: "author",
  foreignField: "_id",
  justOne: true,
});

postSchema.set("toObject", { virtuals: true });
postSchema.set("toJSON", { virtuals: true });

postSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const PostModel = mongoose.models.post || mongoose.model("post", postSchema);

export default PostModel;

