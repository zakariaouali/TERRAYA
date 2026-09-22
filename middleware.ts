import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "terraya_session";

function getSecret(): Uint8Array | null {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = getSecret();
  if (!token || !secret) return redirectToLogin(req);

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (payload.role !== "ADMIN" && payload.role !== "EDITOR") return redirectToLogin(req);
    return NextResponse.next();
  } catch {
    return redirectToLogin(req);
  }
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
