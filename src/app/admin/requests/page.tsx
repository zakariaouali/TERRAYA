import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatEur(n: bigint | null): string | null {
  if (n == null) return null;
  return `€${Number(n).toLocaleString("en-US")}`;
}

export default async function AdminRequestsPage() {
  let requests: Awaited<ReturnType<typeof prisma.propertyRequest.findMany>> = [];
  try {
    requests = await prisma.propertyRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    // ignore — DB not connected
  }

  return (
    <div>
      <p className="eyebrow">Buyer briefs</p>
      <h1 className="font-display text-5xl text-sand-900 mt-3">Property requests.</h1>
      <p className="mt-3 text-sand-700">Clients who couldn&apos;t find what they wanted in the collection and told us directly.</p>

      <div className="mt-10 grid gap-6">
        {requests.map((r) => {
          const budget = [formatEur(r.minBudget), formatEur(r.maxBudget)].filter(Boolean).join(" – ");
          return (
            <article key={r.id} className="border border-sand-200 p-8 bg-sand-50">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-display text-2xl text-sand-900">{r.name}</p>
                  <p className="text-sand-600 text-sm">{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="eyebrow">{r.status}</span>
                  <span className="text-sand-500 text-xs">
                    {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(r.createdAt)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-sand-700">
                <p className="eyebrow">{r.listingType === "RENT" ? "Rent" : "Buy"}</p>
                {r.propertyType && <p className="eyebrow">{r.propertyType}</p>}
                {r.city && <p className="eyebrow">{r.city}</p>}
                {r.bedrooms != null && <p className="eyebrow">{r.bedrooms}+ bed</p>}
                {budget && <p className="eyebrow">{budget}</p>}
              </div>
              {r.notes && <p className="mt-5 text-sand-800 leading-relaxed whitespace-pre-line">{r.notes}</p>}
            </article>
          );
        })}
        {requests.length === 0 && (
          <p className="text-sand-600 italic">No requests yet.</p>
        )}
      </div>
    </div>
  );
}
