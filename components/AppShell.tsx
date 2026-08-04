"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PlusCircle, ListMusic, LogOut, Music2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/concerts/new", label: "Add Concert", icon: PlusCircle },
  { href: "/concerts", label: "My Concerts", icon: ListMusic },
];

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <header className="border-b border-base-300/60 bg-base-100/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-box bg-primary/15 p-2 text-primary">
                <Music2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
                  Concert Cost Tracker
                </h1>
                <p className="mt-1 max-w-xl text-sm text-base-content/70">
                  Track what you spend on live shows — and how much fun you got for every dollar.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <ThemeSelector />
              <div className="badge badge-ghost badge-lg max-w-[14rem] truncate px-3">
                {email}
              </div>
              <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>

          <nav className="tabs tabs-box w-full overflow-x-auto bg-base-200/80 p-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href === "/concerts" && pathname === "/concerts") ||
                (href === "/concerts/new" && pathname.startsWith("/concerts/new"));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`tab gap-2 whitespace-nowrap ${active ? "tab-active" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
