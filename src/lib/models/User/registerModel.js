import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    mobile_number: {
      type: String,
      required: true,
      unique: true,
    },
    number_verified: {
      type: Boolean,
      default: false,
    },
    email_id: {
      type: String,
      required: true,
      unique: true,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    loginTime: {
      type: Date,
    },
    logoutTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.models.register || mongoose.model("register", userSchema);

export default UserModel;

