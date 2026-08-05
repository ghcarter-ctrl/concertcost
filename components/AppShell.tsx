"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  ListMusic,
  LogOut,
  Music2,
  PiggyBank,
  Ticket,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";
import { ToastProvider } from "@/components/Toast";

const NAV = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { href: "/tickets", label: "Find Tickets", short: "Tickets", icon: Ticket },
  { href: "/concerts/new", label: "Add Concert", short: "Add", icon: PlusCircle },
  { href: "/concerts", label: "My Concerts", short: "Shows", icon: ListMusic },
  { href: "/savings", label: "Concert Savings", short: "Save", icon: PiggyBank },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  if (href === "/tickets") return pathname.startsWith("/tickets");
  if (href === "/concerts/new") return pathname.startsWith("/concerts/new");
  if (href === "/concerts") {
    return pathname === "/concerts" || (pathname.startsWith("/concerts/") && !pathname.startsWith("/concerts/new"));
  }
  if (href === "/savings") return pathname.startsWith("/savings");
  return pathname === href;
}

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
    <ToastProvider>
      <div className="min-h-screen bg-base-200 pb-20 md:pb-0">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <header className="sticky top-0 z-40 border-b border-base-300/60 bg-base-100/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="rounded-box bg-primary/15 p-1.5 text-primary">
                  <Music2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-display truncate text-lg font-bold tracking-tight sm:text-xl">
                    Concert Cost Tracker
                  </p>
                  <p className="hidden truncate text-xs text-base-content/60 sm:block">
                    Spend less. Remember the fun.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                <ThemeSelector />
                <div className="badge badge-ghost hidden max-w-[12rem] truncate px-2.5 sm:inline-flex">
                  {email}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm gap-1 pressable"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </div>
            </div>

            <nav className="tabs tabs-box hidden w-full overflow-x-auto bg-base-200/80 p-1 md:flex">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = isNavActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`tab gap-2 whitespace-nowrap transition-all ${active ? "tab-active" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-base-300/70 bg-base-100/95 backdrop-blur-md md:hidden">
          <div className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1 py-1.5">
            {NAV.map(({ href, short, icon: Icon }) => {
              const active = isNavActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-0.5 rounded-box px-2 py-2 text-xs transition-colors pressable ${
                    active
                      ? "bg-primary/15 font-semibold text-primary"
                      : "text-base-content/70"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {short}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </ToastProvider>
  );
}
