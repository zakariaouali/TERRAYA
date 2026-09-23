// Small, deliberately plain HTML email templates — inline styles only, since
// email clients strip <style> blocks and external fonts. Kept minimal on
// purpose: these are transactional notices, not marketing pieces.

const wrap = (title: string, bodyHtml: string) => `
<div style="font-family: Georgia, 'Times New Roman', serif; color: #2b2521; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
  <p style="letter-spacing: 0.2em; text-transform: uppercase; font-size: 11px; color: #8a7a68; margin: 0 0 24px;">TERRAYA</p>
  <h1 style="font-size: 22px; font-weight: 400; margin: 0 0 20px;">${title}</h1>
  ${bodyHtml}
  <p style="margin-top: 32px; font-size: 12px; color: #8a7a68;">TERRAYA · Résidence Les Jasmins, Hivernage, Marrakech 40000, Morocco</p>
</div>`;

const row = (label: string, value?: string | null) =>
  value ? `<p style="margin: 4px 0; font-size: 14px;"><strong>${label}:</strong> ${escapeHtml(value)}</p>` : "";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function inquiryClientEmail(data: {
  name: string;
  propertyTitle?: string | null;
  message: string;
}): { subject: string; html: string } {
  const about = data.propertyTitle ? ` about ${escapeHtml(data.propertyTitle)}` : "";
  return {
    subject: "We've received your inquiry — TERRAYA",
    html: wrap(
      "Thank you.",
      `<p style="font-size: 15px; line-height: 1.6;">Dear ${escapeHtml(data.name)},</p>
       <p style="font-size: 15px; line-height: 1.6;">We've received your inquiry${about}. A member of our private office will respond within one business day, in confidence.</p>
       <p style="font-size: 13px; line-height: 1.6; color: #55493d; border-left: 2px solid #d8cdbe; padding-left: 12px; margin: 20px 0;">${escapeHtml(data.message)}</p>
       <p style="font-size: 15px; line-height: 1.6;">If it's more convenient, you're welcome to reach us directly on WhatsApp at +212 694-838739.</p>`
    ),
  };
}

export function inquiryOwnerEmail(data: {
  name: string;
  email: string;
  phone?: string | null;
  budget?: string | null;
  propertyTitle?: string | null;
  message: string;
}): { subject: string; html: string } {
  const subjectSuffix = data.propertyTitle ? ` — ${data.propertyTitle}` : "";
  return {
    subject: `New inquiry — ${data.name}${subjectSuffix}`,
    html: wrap(
      "New inquiry.",
      `${row("Name", data.name)}
       ${row("Email", data.email)}
       ${row("Phone", data.phone)}
       ${row("Budget", data.budget)}
       ${row("Property", data.propertyTitle)}
       <p style="margin: 16px 0 4px; font-size: 14px;"><strong>Message:</strong></p>
       <p style="font-size: 14px; line-height: 1.6;">${escapeHtml(data.message)}</p>`
    ),
  };
}

export function consultationClientEmail(data: {
  name: string;
  date?: string | null;
  time?: string | null;
}): { subject: string; html: string } {
  const when = [data.date, data.time].filter(Boolean).join(" · ");
  return {
    subject: "Your consultation request — TERRAYA",
    html: wrap(
      "Request received.",
      `<p style="font-size: 15px; line-height: 1.6;">Dear ${escapeHtml(data.name)},</p>
       <p style="font-size: 15px; line-height: 1.6;">We've received your request for a private consultation${when ? ` (${escapeHtml(when)})` : ""}. A member of our office will confirm your appointment within one business day.</p>`
    ),
  };
}

export function consultationOwnerEmail(data: {
  name: string;
  email: string;
  phone?: string | null;
  date?: string | null;
  time?: string | null;
  message?: string | null;
}): { subject: string; html: string } {
  return {
    subject: `New consultation request — ${data.name}`,
    html: wrap(
      "New consultation request.",
      `${row("Name", data.name)}
       ${row("Email", data.email)}
       ${row("Phone", data.phone)}
       ${row("Preferred date", data.date)}
       ${row("Preferred time", data.time)}
       ${data.message ? `<p style="margin: 16px 0 4px; font-size: 14px;"><strong>Message:</strong></p><p style="font-size: 14px; line-height: 1.6;">${escapeHtml(data.message)}</p>` : ""}`
    ),
  };
}

export function propertyRequestClientEmail(data: { name: string }): { subject: string; html: string } {
  return {
    subject: "We're on it — TERRAYA",
    html: wrap(
      "We're on it.",
      `<p style="font-size: 15px; line-height: 1.6;">Dear ${escapeHtml(data.name)},</p>
       <p style="font-size: 15px; line-height: 1.6;">Thank you for telling us exactly what you're looking for. Our office will search our full portfolio — including properties not yet listed publicly — and a member of our team will contact you personally within one business day.</p>
       <p style="font-size: 15px; line-height: 1.6;">If it's more convenient, you're welcome to reach us directly on WhatsApp at +212 694-838739.</p>`
    ),
  };
}

function formatEur(n?: number | null): string | undefined {
  if (n == null) return undefined;
  return `€${n.toLocaleString("en-US")}`;
}

export function propertyRequestOwnerEmail(data: {
  name: string;
  email: string;
  phone?: string | null;
  listingType: string;
  propertyType?: string | null;
  city?: string | null;
  bedrooms?: number | null;
  minBudget?: number | null;
  maxBudget?: number | null;
  notes?: string | null;
}): { subject: string; html: string } {
  const budget = [formatEur(data.minBudget), formatEur(data.maxBudget)].filter(Boolean).join(" – ");
  return {
    subject: `New property request — ${data.name}`,
    html: wrap(
      "A client couldn't find what they wanted.",
      `${row("Name", data.name)}
       ${row("Email", data.email)}
       ${row("Phone", data.phone)}
       ${row("Looking to", data.listingType === "RENT" ? "Rent" : "Buy")}
       ${row("Property type", data.propertyType)}
       ${row("Preferred area", data.city)}
       ${row("Bedrooms", data.bedrooms != null ? `${data.bedrooms}+` : undefined)}
       ${row("Budget", budget || undefined)}
       ${data.notes ? `<p style="margin: 16px 0 4px; font-size: 14px;"><strong>Notes:</strong></p><p style="font-size: 14px; line-height: 1.6;">${escapeHtml(data.notes)}</p>` : ""}
       <p style="margin: 16px 0 0; font-size: 13px; color: #55493d;">Review it in /admin/requests.</p>`
    ),
  };
}

export function sellerClientEmail(data: { name: string }): { subject: string; html: string } {
  return {
    subject: "We've received your property submission — TERRAYA",
    html: wrap(
      "Thank you.",
      `<p style="font-size: 15px; line-height: 1.6;">Dear ${escapeHtml(data.name)},</p>
       <p style="font-size: 15px; line-height: 1.6;">We've received your property submission. A member of our office will contact you directly by phone or WhatsApp to learn more, and if it's a fit, we'll arrange for our own team to photograph the property professionally — free of charge. There is no commission unless and until we complete a sale or rental for you.</p>
       <p style="font-size: 15px; line-height: 1.6;">If it's more convenient, you're welcome to reach us directly on WhatsApp at +212 694-838739.</p>`
    ),
  };
}

export function sellerOwnerEmail(data: {
  name: string;
  phone: string;
  email: string;
  propertyType: string;
  listingType: string;
  city: string;
}): { subject: string; html: string } {
  return {
    subject: `New listing submission — ${data.name}`,
    html: wrap(
      "New listing submission.",
      `${row("Name", data.name)}
       ${row("Phone", data.phone)}
       ${row("Email", data.email)}
       ${row("Property type", data.propertyType)}
       ${row("Listing type", data.listingType === "RENT" ? "For Rent" : "For Sale")}
       ${row("City", data.city)}
       <p style="margin: 16px 0 0; font-size: 13px; color: #55493d;">Review it and its photos in /admin/listings.</p>`
    ),
  };
}
