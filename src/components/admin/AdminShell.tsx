import Link from "next/link";
import { LayoutDashboard, Building2, Inbox, LogOut } from "lucide-react";
import { Wordmark } from "@/components/shared/Wordmark";

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[260px_1fr] bg-sand-50">
      <aside className="border-r border-sand-200 p-8 lg:sticky lg:top-0 lg:h-screen flex flex-col">
        <Wordmark subtitle />
        <nav className="mt-12 flex flex-col gap-2 text-sm">
          <NavLink href="/admin" icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <NavLink href="/admin/properties" icon={<Building2 size={16} />} label="Properties" />
          <NavLink href="/admin/inquiries" icon={<Inbox size={16} />} label="Inquiries" />
        </nav>
        <div className="mt-auto pt-8 border-t border-sand-200">
          <p className="eyebrow">Signed in</p>
          <p className="text-sand-800 mt-2 text-sm break-all">{email}</p>
          <form action="/api/auth/logout" method="POST" className="mt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-sand-700 hover:text-sand-900"
            >
              <LogOut size={14} /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="p-8 lg:p-14">{children}</main>
    </div>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sand-800 hover:bg-sand-200/60 transition-colors"
    >
      <span className="text-sand-600">{icon}</span>
      <span className="tracking-[0.18em] uppercase text-xs">{label}</span>
    </Link>
  );
}
