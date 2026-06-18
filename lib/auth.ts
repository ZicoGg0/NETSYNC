import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { UserSession } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = "7d";
const COOKIE_NAME = "netsync_token";

function getSecret(): string {
  if (!JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not set. Add it to your .env.local file. Generate with: openssl rand -base64 32"
    );
  }
  return JWT_SECRET;
}

export function generateToken(user: {
  id: string;
  phone: string;
  role: string;
  name: string | null;
}): string {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role, name: user.name },
    getSecret(),
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as UserSession;
    return decoded;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookie(token: string): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    },
  };
}

export function clearAuthCookie(): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    },
  };
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return "****";
  return "*".repeat(phone.length - 4) + phone.slice(-4);
}
