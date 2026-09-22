import { Resend } from "resend";

/**
 * Transactional email via Resend. Mirrors the `hasDatabase()` pattern in
 * lib/leads.ts: when RESEND_API_KEY isn't configured (e.g. no domain bought
 * yet), sendEmail() is a silent no-op instead of throwing, so the
 * inquiry/consultation flows keep working with email simply dormant.
 */
export function hasEmail(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

let client: Resend | null = null;
function getClient(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

// Resend's shared sandbox sender, usable with no domain of your own — swap
// EMAIL_FROM once a real domain is bought and verified in Resend.
const DEFAULT_FROM = "TERRAYA <onboarding@resend.dev>";

export async function sendEmail(input: { to: string; subject: string; html: string }): Promise<void> {
  if (!hasEmail()) return;
  try {
    await getClient().emails.send({
      from: process.env.EMAIL_FROM ?? DEFAULT_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  } catch (err) {
    // Never let an email failure break the inquiry/consultation flow itself.
    console.warn("[email] send failed:", err);
  }
}
