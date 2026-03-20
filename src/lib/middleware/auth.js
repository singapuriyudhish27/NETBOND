import { getUser } from "../services/authJWTUser";
import { cookies } from "next/headers";

export async function checkForAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("uid")?.value;

  if (!token) {
    return null;
  }

  try {
    const decodeToken = getUser(token);
    return decodeToken;
  } catch (error) {
    return null;
  }
}

// For use in API routes - async version (recommended for Next.js 15)
export async function getAuthFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("uid")?.value;

  if (!token) {
    return null;
  }

  try {
    const decodeToken = getUser(token);
    return decodeToken;
  } catch (error) {
    return null;
  }
}

