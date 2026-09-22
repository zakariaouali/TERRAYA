"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setError(json.error ?? "Invalid credentials.");
      setLoading(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <Container className="pt-40 pb-32 max-w-md">
      <p className="eyebrow mb-4"><span className="luxury-divider">Private Portal</span></p>
      <h1 className="font-display text-5xl text-sand-900 dark:text-sand-100 leading-[1.05]">Sign in.</h1>
      <p className="mt-4 text-sand-700 dark:text-sand-300 leading-relaxed">
        Access is reserved for the TERRAYA office and authorised clients.
      </p>

      <form onSubmit={onSubmit} className="mt-12 grid gap-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" />
        </div>
        {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-10 text-sm text-sand-600 dark:text-sand-400">
        <Link href="/">← Return to TERRAYA</Link>
      </p>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
