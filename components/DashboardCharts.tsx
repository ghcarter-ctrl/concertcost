"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ConcertWithMetrics, DashboardStats } from "@/lib/metrics";
import { formatCurrency, formatNumber } from "@/lib/metrics";

const FALLBACK_COLORS = [
  "#0d9488",
  "#db2777",
  "#d97706",
  "#2563eb",
  "#16a34a",
  "#9333ea",
  "#dc2626",
  "#0891b2",
];

function readThemeColors(): string[] {
  if (typeof window === "undefined") return FALLBACK_COLORS;
  const styles = getComputedStyle(document.documentElement);
  const keys = [
    "--color-primary",
    "--color-secondary",
    "--color-accent",
    "--color-info",
    "--color-success",
    "--color-warning",
    "--color-error",
  ];
  const fromTheme = keys
    .map((k) => styles.getPropertyValue(k).trim())
    .filter(Boolean);
  return fromTheme.length >= 3 ? [...fromTheme, ...FALLBACK_COLORS] : FALLBACK_COLORS;
}

function ChartCard({
  title,
  helper,
  children,
}: {
  title: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card border border-base-300/70 bg-base-100 shadow-sm animate-fade-up">
      <div className="card-body">
        <div>
          <h3 className="card-title text-base">{title}</h3>
          {helper ? <p className="text-xs text-base-content/55">{helper}</p> : null}
        </div>
        <div className="h-72 w-full">{children}</div>
      </div>
    </div>
  );
}

function shortName(name: string) {
  return name.length > 14 ? `${name.slice(0, 12)}…` : name;
}

export function DashboardCharts({
  concerts,
  stats,
}: {
  concerts: ConcertWithMetrics[];
  stats: DashboardStats;
}) {
  const [colors, setColors] = useState<string[]>(FALLBACK_COLORS);

  useEffect(() => {
    setColors(readThemeColors());
    const observer = new MutationObserver(() => setColors(readThemeColors()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const barPrimary = colors[0] ?? FALLBACK_COLORS[0];
  const barSecondary = colors[1] ?? FALLBACK_COLORS[1];
  const barAccent = colors[2] ?? FALLBACK_COLORS[2];

  const costByConcert = useMemo(
    () =>
      concerts.map((c) => ({
        name: shortName(c.concert_name),
        fullName: c.concert_name,
        value: c.totalCost,
      })),
    [concerts]
  );

  const funByConcert = useMemo(
    () =>
      concerts.map((c) => ({
        name: shortName(c.concert_name),
        fullName: c.concert_name,
        value: Number(c.fun_rating),
      })),
    [concerts]
  );

  const funPerDollar = useMemo(
    () =>
      concerts
        .filter((c) => c.funPointsPer100 !== null)
        .map((c) => ({
          name: shortName(c.concert_name),
          fullName: c.concert_name,
          value: Number(c.funPointsPer100?.toFixed(2)),
        })),
    [concerts]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Spending by cost category" helper="Where your money went across all shows">
        {stats.spendingByCategory.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-base-content/60">
            No spending data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.spendingByCategory}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name }) => name}
              >
                {stats.spendingByCategory.map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Total cost by concert" helper="Compare how much each show cost overall">
        {costByConcert.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-base-content/60">
            No concerts yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costByConcert} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
              />
              <Bar dataKey="value" fill={barPrimary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Fun rating by concert" helper="How much fun each show scored (1–10)">
        {funByConcert.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-base-content/60">
            No concerts yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funByConcert} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} />
              <YAxis domain={[0, 10]} />
              <Tooltip
                formatter={(value) => formatNumber(Number(value), 0)}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
              />
              <Bar dataKey="value" fill={barSecondary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        title="Fun Points per $100 by concert"
        helper="Higher means better value for the money"
      >
        {funPerDollar.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-base-content/60">
            Add costs to see value scores
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funPerDollar} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} />
              <YAxis />
              <Tooltip
                formatter={(value) => formatNumber(Number(value), 2)}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
              />
              <Bar dataKey="value" fill={barAccent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
