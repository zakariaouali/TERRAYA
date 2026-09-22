"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const items = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
];

export function Faq() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-28 lg:py-40">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-4"><span className="luxury-divider">{t("faq.eyebrow")}</span></p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-sand-900 dark:text-sand-100">
              {t("faq.title")}
            </h2>
          </div>

          <div className="border-t border-sand-200 dark:border-sand-800">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q} className="border-b border-sand-200 dark:border-sand-800">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-sand-600 dark:hover:text-sand-300"
                  >
                    <span className="font-display text-xl text-sand-900 dark:text-sand-100 md:text-2xl">
                      {t(item.q)}
                    </span>
                    <Plus
                      size={20}
                      className={cn(
                        "shrink-0 text-sand-500 transition-transform duration-300",
                        isOpen && "rotate-45"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="min-h-0">
                      <p className="pb-7 pr-10 leading-relaxed text-sand-700 dark:text-sand-300">
                        {t(item.a)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
