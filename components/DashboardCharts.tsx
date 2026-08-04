"use client";

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

// Solid chart colors stay readable across light daisyUI themes (cupcake, etc.).
const COLORS = [
  "#0d9488",
  "#db2777",
  "#d97706",
  "#2563eb",
  "#16a34a",
  "#9333ea",
  "#dc2626",
  "#0891b2",
];

const BAR_PRIMARY = COLORS[0];
const BAR_SECONDARY = COLORS[1];
const BAR_ACCENT = COLORS[2];

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card border border-base-300/70 bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-base">{title}</h3>
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
  const costByConcert = concerts.map((c) => ({
    name: shortName(c.concert_name),
    fullName: c.concert_name,
    value: c.totalCost,
  }));

  const funByConcert = concerts.map((c) => ({
    name: shortName(c.concert_name),
    fullName: c.concert_name,
    value: Number(c.fun_rating),
  }));

  const funPerDollar = concerts
    .filter((c) => c.funPointsPer100 !== null)
    .map((c) => ({
      name: shortName(c.concert_name),
      fullName: c.concert_name,
      value: Number(c.funPointsPer100?.toFixed(2)),
    }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Spending by cost category">
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
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Total cost by concert">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={costByConcert} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} />
            <YAxis tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
            />
            <Bar dataKey="value" fill={BAR_PRIMARY} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Fun rating by concert">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funByConcert} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} />
            <YAxis domain={[0, 10]} />
            <Tooltip
              formatter={(value) => formatNumber(Number(value), 0)}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
            />
            <Bar dataKey="value" fill={BAR_SECONDARY} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Fun Points per $100 by concert">
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
              <Bar dataKey="value" fill={BAR_ACCENT} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
