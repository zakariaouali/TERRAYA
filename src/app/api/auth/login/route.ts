import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { signSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { ok, fail } from "@/lib/api";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`login:${ip}`, 5, 60_000);
  if (!rl.ok) return fail("Too many attempts. Please try again shortly.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request body.");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid email or password.", 400);

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    await audit({ action: "LOGIN_FAILED", entity: "User", ip, metadata: { email } });
    return fail("Invalid email or password.", 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await audit({ userId: user.id, action: "LOGIN_FAILED", entity: "User", entityId: user.id, ip });
    return fail("Invalid email or password.", 401);
  }

  const token = await signSession({ sub: user.id, email: user.email, role: user.role });
  await setSessionCookie(token);
  await audit({ userId: user.id, action: "LOGIN", entity: "User", entityId: user.id, ip });

  return ok({ email: user.email, role: user.role });
}
