"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Currency = "EUR" | "MAD" | "USD";

// Indicative conversion rates from EUR. Adjust or wire to a live source as needed.
const RATES: Record<Currency, number> = { EUR: 1, MAD: 10.85, USD: 1.08 };
const LOCALE: Record<Currency, string> = { EUR: "en-EU", MAD: "fr-MA", USD: "en-US" };

const STORAGE_KEY = "terraya-currency";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Convert an amount given in EUR to the active currency and format it. */
  format: (eur: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "EUR",
  setCurrency: () => {},
  format: (eur) => `€${eur}`,
});

export const CURRENCIES: Currency[] = ["EUR", "MAD", "USD"];

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "EUR" || stored === "MAD" || stored === "USD") setCurrencyState(stored);
  }, []);

  const setCurrency = (next: Currency) => {
    setCurrencyState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const format = (eur: number) =>
    new Intl.NumberFormat(LOCALE[currency], {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(eur * RATES[currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
