// Central contact details. Replace these with the real agency numbers/email.
export const CONTACT = {
  phone: "+212 694-838739",
  phoneHref: "tel:+212694838739",
  whatsapp: "212694838739",
  email: "Estateterraya@contact.com",
  addressLines: ["Résidence Les Jasmins", "Hivernage, Marrakech 40000", "Morocco"],
  // Marrakech (Hivernage) — used for the embedded map.
  lat: 31.6225,
  lng: -8.0119,
};

export function whatsappHref(message?: string) {
  const base = `https://wa.me/${CONTACT.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
