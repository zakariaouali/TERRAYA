import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { compare, hash } from "bcrypt-ts";

const COOKIE = "terraya_session";
const ALG = "HS256";

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET must be set (>=32 chars)");
  return new TextEncoder().encode(s);
}

export type SessionPayload = JWTPayload & {
  sub: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
};

export async function signSession(payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: [ALG] });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE);
}

export async function hashPassword(plain: string) {
  return hash(plain, 12);
}

export async function verifyPassword(plain: string, hashed: string) {
  return compare(plain, hashed);
}

export const SESSION_COOKIE = COOKIE;
