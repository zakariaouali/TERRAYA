import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ListingSubmissionRowActions } from "@/components/admin/ListingSubmissionRowActions";

export const dynamic = "force-dynamic";

function parseArr(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default async function AdminListingsPage() {
  let submissions: Awaited<ReturnType<typeof prisma.listingSubmission.findMany>> = [];
  try {
    submissions = await prisma.listingSubmission.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    // ignore — DB not connected
  }

  return (
    <div>
      <p className="eyebrow">Sellers</p>
      <h1 className="font-display text-5xl text-sand-900 mt-3">Listing submissions.</h1>

      <div className="mt-10 border border-sand-200 bg-sand-50">
        <table className="w-full text-sm">
          <thead className="bg-sand-100">
            <tr className="text-left text-sand-700">
              <th className="px-5 py-4 eyebrow">Photo</th>
              <th className="px-5 py-4 eyebrow">Name</th>
              <th className="px-5 py-4 eyebrow">Contact</th>
              <th className="px-5 py-4 eyebrow">Type</th>
              <th className="px-5 py-4 eyebrow">City</th>
              <th className="px-5 py-4 eyebrow text-right">Status / Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => {
              const images = parseArr(s.images);
              return (
                <tr key={s.id} className="border-t border-sand-200">
                  <td className="px-5 py-4">
                    {images[0] ? (
                      <div className="relative h-14 w-14 overflow-hidden border border-sand-200">
                        <Image src={images[0]} alt="" fill sizes="56px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-14 w-14 border border-sand-200 bg-sand-100" />
                    )}
                  </td>
                  <td className="px-5 py-4 text-sand-900 font-medium">{s.name}</td>
                  <td className="px-5 py-4 text-sand-700">{s.phone} · {s.email}</td>
                  <td className="px-5 py-4 text-sand-700">{s.propertyType}</td>
                  <td className="px-5 py-4 text-sand-700">{s.city}</td>
                  <td className="px-5 py-4 text-right"><ListingSubmissionRowActions id={s.id} status={s.status} /></td>
                </tr>
              );
            })}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sand-600 italic">
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
