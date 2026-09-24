import { NextResponse } from "next/server";
import { searchProperties } from "@/lib/properties";
import { parseFilters } from "@/lib/property-search";

// Public, read-only: powers the live "Show N properties" count in the filter
// drawer. Uses the exact same search as the listing page.
export async function GET(req: Request) {
  const filters = parseFilters(new URL(req.url).searchParams);
  const results = await searchProperties(filters);
  return NextResponse.json({ count: results.length }, { headers: { "Cache-Control": "no-store" } });
}
