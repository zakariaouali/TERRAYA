"use client";

import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { whatsappHref, whatsappMessageForPath } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";

export function WhatsAppButton() {
  const { t } = useLang();
  const pathname = usePathname();

  return (
    <a
      href={whatsappHref(whatsappMessageForPath(pathname ?? "/"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp.label")}
      title={t("whatsapp.label")}
      className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-sand-900 text-sand-50 shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:scale-105 hover:bg-sand-800 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-white"
    >
      <WhatsAppIcon size={24} />
    </a>
  );
}
