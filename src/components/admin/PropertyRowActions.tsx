"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/shared/Spinner";

export function PropertyRowActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      setBusy(false);
      alert("Could not delete. Please try again.");
    }
  }

  return (
    <div className="flex items-center gap-4 text-xs uppercase tracking-[0.18em]">
      <Link href={`/admin/properties/${id}/edit`} className="text-sand-900 hover:underline">
        Edit
      </Link>
      <button type="button" onClick={onDelete} disabled={busy} className="inline-flex items-center gap-1.5 text-red-700 hover:underline disabled:opacity-50">
        {busy && <Spinner size={13} />}
        {busy ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
