"use client";

import type { ListingType } from "@/data/properties";
import { useCurrency } from "@/lib/currency";

export function Price({
  eur,
  listingType = "SALE",
  className,
}: {
  eur: number;
  listingType?: ListingType;
  className?: string;
}) {
  const { format } = useCurrency();
  const suffix = listingType === "RENT" ? " / month" : "";
  return (
    <span className={className}>
      {format(eur)}
      {suffix}
    </span>
  );
}
