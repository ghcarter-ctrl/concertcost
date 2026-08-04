import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";
import {
  computeDashboardStats,
  formatCurrency,
  formatNumber,
  withMetrics,
} from "@/lib/metrics";
import { EmptyState, StatCard } from "@/components/StatCard";
import { DashboardCharts } from "@/components/DashboardCharts";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Could not load concerts: {error.message}</span>
      </div>
    );
  }

  const concerts = (data ?? []) as Concert[];
  const withMet = concerts.map(withMetrics);
  const stats = computeDashboardStats(concerts);

  if (concerts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-base-content/65">
          A quick look at your concert spending and which shows were worth it.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total concerts" value={String(stats.totalConcerts)} />
        <StatCard title="Total amount spent" value={formatCurrency(stats.totalSpent)} />
        <StatCard
          title="Average cost per concert"
          value={stats.averageCost === null ? "—" : formatCurrency(stats.averageCost)}
        />
        <StatCard
          title="Average fun rating"
          value={
            stats.averageFun === null ? "—" : `${formatNumber(stats.averageFun, 1)} / 10`
          }
        />
        <StatCard
          title="Average cost per hour"
          value={
            stats.averageCostPerHour === null
              ? "—"
              : formatCurrency(stats.averageCostPerHour)
          }
        />
        <StatCard
          title="Best value concert"
          value={stats.bestValue?.concert_name ?? "—"}
          hint={
            stats.bestValue?.funPointsPer100 != null
              ? `${formatNumber(stats.bestValue.funPointsPer100, 2)} Fun Points per $100`
              : undefined
          }
        />
        <StatCard
          title="Most expensive concert"
          value={stats.mostExpensive?.concert_name ?? "—"}
          hint={
            stats.mostExpensive
              ? formatCurrency(stats.mostExpensive.totalCost)
              : undefined
          }
        />
        <StatCard
          title="Highest fun rating"
          value={stats.highestFun?.concert_name ?? "—"}
          hint={stats.highestFun ? `${stats.highestFun.fun_rating}/10` : undefined}
        />
      </div>

      <DashboardCharts concerts={withMet} stats={stats} />
    </div>
  );
}
