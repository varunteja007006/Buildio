"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@workspace/ui/components/button";
import { useSession } from "@/api/auth/query";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session, isLoading } = useSession();
  const router = useRouter();
  const isAuthenticated = !!session?.user;

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Cortex
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <ThemeToggle />

          {!isLoading && !isAuthenticated && (
            <>
              <Link
                href="/sign-in"
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none h-7 gap-1 px-2.5 text-[0.8rem] bg-primary text-primary-foreground hover:bg-primary/80"
              >
                Sign Up
              </Link>
            </>
          )}

          {!isLoading && isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
