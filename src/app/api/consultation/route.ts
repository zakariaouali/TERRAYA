import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { consultationSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { appendLead, hasDatabase } from "@/lib/leads";
import { ok, fail } from "@/lib/api";
import { sendEmail } from "@/lib/email";
import { consultationClientEmail, consultationOwnerEmail } from "@/lib/email-templates";

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
  const email = d.email.toLowerCase();

  if (!hasDatabase()) {
    await appendLead("consultation", {
      name: d.name,
      email,
      phone: d.phone,
      date: d.date,
      time: d.time,
      message: d.message,
      ip,
    });
    await notify({ ...d, email });
    return ok({ booked: true }, { status: 201 });
  }

  await prisma.consultationRequest.create({
    data: {
      name: d.name,
      email,
      phone: d.phone,
      date: d.date,
      time: d.time,
      message: d.message,
      ip,
    },
  });

  await notify({ ...d, email });

  return ok({ booked: true }, { status: 201 });
}

/** Client confirmation + owner notification. Dormant no-op until an email provider is configured. */
async function notify(data: {
  name: string;
  email: string;
  phone?: string;
  date?: string;
  time?: string;
  message?: string;
}) {
  const client = consultationClientEmail({ name: data.name, date: data.date, time: data.time });
  await sendEmail({ to: data.email, subject: client.subject, html: client.html });

  const ownerEmail = process.env.ADMIN_EMAIL;
  if (ownerEmail) {
    const owner = consultationOwnerEmail(data);
    await sendEmail({ to: ownerEmail, subject: owner.subject, html: owner.html });
  }
}
