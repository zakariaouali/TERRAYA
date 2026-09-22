import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEur } from "@/lib/utils";
import { PropertyRowActions } from "@/components/admin/PropertyRowActions";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  let properties: Awaited<ReturnType<typeof prisma.property.findMany>> = [];
  try {
    properties = await prisma.property.findMany({
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // ignore — DB not connected
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1 className="font-display text-5xl text-sand-900 mt-3">Properties.</h1>
        </div>
        <Link
          href="/admin/properties/new"
          className="bg-sand-900 text-sand-50 px-6 py-3 tracking-[0.22em] uppercase text-xs hover:bg-sand-800"
        >
          New Property
        </Link>
      </div>

      <div className="mt-10 border border-sand-200 bg-sand-50">
        <table className="w-full text-sm">
          <thead className="bg-sand-100">
            <tr className="text-left text-sand-700">
              <th className="px-5 py-4 eyebrow">Title</th>
              <th className="px-5 py-4 eyebrow">Location</th>
              <th className="px-5 py-4 eyebrow">Type</th>
              <th className="px-5 py-4 eyebrow">Price</th>
              <th className="px-5 py-4 eyebrow">Status</th>
              <th className="px-5 py-4 eyebrow text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-t border-sand-200">
                <td className="px-5 py-4 text-sand-900 font-medium">
                  <Link href={`/properties/${p.slug}`} className="hover:underline">{p.title}</Link>
                </td>
                <td className="px-5 py-4 text-sand-700">{p.city}, {p.country}</td>
                <td className="px-5 py-4 text-sand-700">{p.type}</td>
                <td className="px-5 py-4 text-sand-900">{formatEur(p.priceEur)}</td>
                <td className="px-5 py-4 text-sand-700">{p.status}</td>
                <td className="px-5 py-4 text-right"><PropertyRowActions id={p.id} title={p.title} /></td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sand-600 italic">
                  No properties yet. Run <code className="font-mono">npm run db:seed</code> to populate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
