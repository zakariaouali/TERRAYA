import { NextRequest } from "next/server";
import { newsletterSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { appendLead } from "@/lib/leads";
import { ok, fail } from "@/lib/api";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`newsletter:${ip}`, 5, 60_000);
  if (!rl.ok) return fail("Too many requests. Please try again shortly.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid body.");
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) return fail("Please enter a valid email address.");

  await appendLead("newsletter", { email: parsed.data.email.toLowerCase(), ip });

  return ok({ subscribed: true }, { status: 201 });
}
