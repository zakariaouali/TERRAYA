import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  let inquiries: Awaited<ReturnType<typeof prisma.inquiry.findMany>> = [];
  try {
    inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    // ignore
  }

  return (
    <div>
      <p className="eyebrow">Communications</p>
      <h1 className="font-display text-5xl text-sand-900 mt-3">Inquiries.</h1>

      <div className="mt-10 grid gap-6">
        {inquiries.map((i) => (
          <article key={i.id} className="border border-sand-200 p-8 bg-sand-50">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="font-display text-2xl text-sand-900">{i.name}</p>
                <p className="text-sand-600 text-sm">{i.email}{i.phone ? ` · ${i.phone}` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="eyebrow">{i.status}</span>
                <span className="text-sand-500 text-xs">
                  {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(i.createdAt)}
                </span>
              </div>
            </div>
            {i.budget && <p className="mt-2 eyebrow">Budget · <span className="normal-case tracking-normal">{i.budget}</span></p>}
            <p className="mt-5 text-sand-800 leading-relaxed whitespace-pre-line">{i.message}</p>
          </article>
        ))}
        {inquiries.length === 0 && (
          <p className="text-sand-600 italic">No inquiries yet.</p>
        )}
      </div>
    </div>
  );
}
