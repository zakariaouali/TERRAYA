import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ListingType } from "@/data/properties";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEur(value: number | bigint): string {
  const n = typeof value === "bigint" ? Number(value) : value;
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

const PRICE_SUFFIX: Record<ListingType, string> = {
  SALE: "",
  RENT: " / month",
  HOLIDAY_RENT: " / night",
};

const PRICE_LABEL: Record<ListingType, string> = {
  SALE: "Guide Price",
  RENT: "Monthly Rent",
  HOLIDAY_RENT: "Nightly Rate",
};

export type RentalPeriod = "DAY" | "WEEK";

export function formatListingPrice(
  value: number | bigint,
  listingType: ListingType,
  _rentalPeriod?: RentalPeriod
): string {
  return `${formatEur(value)}${PRICE_SUFFIX[listingType]}`;
}

export function listingPriceLabel(listingType: ListingType, rentalPeriod?: RentalPeriod | null): string {
  if (listingType === "HOLIDAY_RENT") return rentalPeriod === "WEEK" ? "Weekly Rate" : "Nightly Rate";
  return PRICE_LABEL[listingType];
}

export function formatArea(sqm: number): string {
  return `${new Intl.NumberFormat("en-EU").format(sqm)} m²`;
}
