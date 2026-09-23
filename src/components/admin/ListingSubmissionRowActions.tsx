"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = ["NEW", "CONTACTED", "CONVERTED", "DECLINED"] as const;

export function ListingSubmissionRowActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onStatusChange(next: string) {
    setBusy(true);
    const res = await fetch(`/api/listing-submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Could not update. Please try again.");
  }

  return (
    <div className="flex items-center gap-4 text-xs uppercase tracking-[0.18em]">
      <select
        value={status}
        disabled={busy || status === "CONVERTED"}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border border-sand-300 bg-sand-50 px-2 py-1 text-sand-800 disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {status !== "CONVERTED" && (
        <Link href={`/admin/properties/new?fromSubmission=${id}`} className="text-sand-900 hover:underline">
          Convert
        </Link>
      )}
    </div>
  );
}
