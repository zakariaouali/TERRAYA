"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";

/**
 * Wraps page content with the public marketing chrome (header, footer, WhatsApp).
 * The admin area has its own shell, so the public chrome is hidden there.
 *
 * The route-change fade is a plain CSS animation on a keyed wrapper, not
 * AnimatePresence: with `mode="wait"`, a page whose predecessor never
 * finishes its exit animation is never mounted at all (header visible,
 * content blank until a reload). A CSS enter animation has no exit phase to
 * wait on, so it cannot leave a page stuck invisible.
 */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div key={pathname} className="animate-page-in">
          {children}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
