import jwt from "jsonwebtoken";

// Ensure this module is only used on the server
if (typeof window !== "undefined") {
  throw new Error("This module can only be used on the server side");
}

const secret = process.env.JWT_SECRET || "yudhish123";

export function setUser(userData) {
  if (!userData || !userData._id) {
    throw new Error("Invalid user data: _id is required");
  }
  
  return jwt.sign(
    {
      _id: userData._id?.toString() || userData._id,
      email_id: userData.email_id,
      username: userData.username,
      password: userData.password,
    },
    secret
  );
}

export function getUser(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

