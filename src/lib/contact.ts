// Central contact details. Replace these with the real agency numbers/email.
export const CONTACT = {
  phone: "+212 694-838739",
  phoneHref: "tel:+212694838739",
  whatsapp: "212694838739",
  email: "Estateterraya@contact.com",
  addressLines: ["Résidence Les Jasmins", "Hivernage, Marrakech 40000", "Morocco"],
  // Office location pin — from the agency's Google Maps link.
  lat: 31.6573327,
  lng: -8.0159617,
};

export function whatsappHref(message?: string) {
  const base = `https://wa.me/${CONTACT.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Page-aware opening line for the floating WhatsApp button, so a message
// sent from any page names what the visitor was looking at — even without
// the more specific per-listing context a property page provides on its own.
const ROUTE_MESSAGES: { prefix: string; message: string }[] = [
  { prefix: "/properties", message: "Hello TERRAYA, I have a question about your properties." },
  { prefix: "/list-your-property", message: "Hello TERRAYA, I'd like to list my property." },
  { prefix: "/investment", message: "Hello TERRAYA, I'd like to know more about your investment advisory." },
  { prefix: "/services", message: "Hello TERRAYA, I'd like to know more about your services." },
  { prefix: "/about", message: "Hello TERRAYA, I'd like to know more about your agency." },
  { prefix: "/consultation", message: "Hello TERRAYA, I'd like to arrange a private consultation." },
  { prefix: "/contact", message: "Hello TERRAYA, I'd like to get in touch." },
];

export function whatsappMessageForPath(pathname: string): string {
  const match = ROUTE_MESSAGES.find((r) => pathname.startsWith(r.prefix));
  return match?.message ?? "Hello TERRAYA, I have a question.";
}
