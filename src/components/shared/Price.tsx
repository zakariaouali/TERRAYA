"use client";

import type { ListingType } from "@/data/properties";
import { useCurrency } from "@/lib/currency";

export function Price({
  eur,
  listingType = "SALE",
  rentalPeriod,
  className,
}: {
  eur: number;
  listingType?: ListingType;
  rentalPeriod?: "DAY" | "WEEK" | null;
  className?: string;
}) {
  const { format } = useCurrency();
  const suffix =
    listingType === "RENT"
      ? " / month"
      : listingType === "HOLIDAY_RENT"
        ? rentalPeriod === "WEEK"
          ? " / week"
          : " / night"
        : "";
  return (
    <span className={className}>
      {format(eur)}
      {suffix}
    </span>
  );
}
