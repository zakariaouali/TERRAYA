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
};

const PRICE_LABEL: Record<ListingType, string> = {
  SALE: "Guide Price",
  RENT: "Monthly Rent",
};

export function formatListingPrice(value: number | bigint, listingType: ListingType): string {
  return `${formatEur(value)}${PRICE_SUFFIX[listingType]}`;
}

export function listingPriceLabel(listingType: ListingType): string {
  return PRICE_LABEL[listingType];
}

// TERRAYA is long-term-only: every rental carries the same firm minimum stay.
export const RENT_MIN_STAY_MONTHS = 6;

export function rentalTerms(listingType: ListingType): string {
  return listingType === "RENT" ? `${RENT_MIN_STAY_MONTHS}-month minimum` : "";
}

export function formatArea(sqm: number): string {
  return `${new Intl.NumberFormat("en-EU").format(sqm)} m²`;
}
