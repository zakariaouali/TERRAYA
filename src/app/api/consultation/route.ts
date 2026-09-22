import { NextRequest } from "next/server";
import { consultationSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { appendLead } from "@/lib/leads";
import { ok, fail } from "@/lib/api";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`consultation:${ip}`, 5, 60_000);
  if (!rl.ok) return fail("Too many requests. Please try again shortly.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid body.");
  }

  const parsed = consultationSchema.safeParse(body);
  if (!parsed.success) return fail("Please review the form and try again.");

  const d = parsed.data;
  await appendLead("consultation", {
    name: d.name,
    email: d.email.toLowerCase(),
    phone: d.phone,
    date: d.date,
    time: d.time,
    message: d.message,
    ip,
  });

  return ok({ booked: true }, { status: 201 });
}
