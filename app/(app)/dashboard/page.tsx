import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";
import {
  computeDashboardStats,
  formatCurrency,
  formatNumber,
  withMetrics,
} from "@/lib/metrics";
import { EmptyState, HighlightCard, StatCard } from "@/components/StatCard";
import { DashboardCharts } from "@/components/DashboardCharts";
import { pageSubtitleClass, pageTitleClass } from "@/lib/ui";

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
    <div className="section-stack">
      <div className="animate-fade-in">
        <h2 className={pageTitleClass}>Dashboard</h2>
        <p className={pageSubtitleClass}>Your concert spending and which shows were worth it.</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/55">
          Overview
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard className="stagger-1" title="Total concerts" value={String(stats.totalConcerts)} />
          <StatCard
            className="stagger-2"
            title="Total amount spent"
            value={formatCurrency(stats.totalSpent)}
          />
          <StatCard
            className="stagger-3"
            title="Average cost per concert"
            value={stats.averageCost === null ? "—" : formatCurrency(stats.averageCost)}
          />
          <StatCard
            className="stagger-4"
            title="Average fun rating"
            value={
              stats.averageFun === null ? "—" : `${formatNumber(stats.averageFun, 1)} / 10`
            }
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            className="stagger-5"
            title="Average cost per hour"
            value={
              stats.averageCostPerHour === null
                ? "—"
                : formatCurrency(stats.averageCostPerHour)
            }
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/55">
          Highlights
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          <HighlightCard
            className="stagger-1"
            title="Best value concert"
            value={stats.bestValue?.concert_name ?? "—"}
            hint={
              stats.bestValue?.funPointsPer100 != null
                ? `${formatNumber(stats.bestValue.funPointsPer100, 2)} Fun Points per $100`
                : undefined
            }
          />
          <HighlightCard
            className="stagger-2"
            title="Most expensive concert"
            value={stats.mostExpensive?.concert_name ?? "—"}
            hint={
              stats.mostExpensive ? formatCurrency(stats.mostExpensive.totalCost) : undefined
            }
          />
          <HighlightCard
            className="stagger-3"
            title="Highest fun rating"
            value={stats.highestFun?.concert_name ?? "—"}
            hint={stats.highestFun ? `${stats.highestFun.fun_rating}/10` : undefined}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/55">
          Charts
        </h3>
        <DashboardCharts concerts={withMet} stats={stats} />
      </section>
    </div>
  );
}
