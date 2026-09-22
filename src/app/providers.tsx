"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { LanguageProvider } from "@/lib/i18n";
import { FavoritesProvider } from "@/lib/favorites";
import { CurrencyProvider } from "@/lib/currency";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <LanguageProvider>
        <CurrencyProvider>
          <FavoritesProvider>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </FavoritesProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
