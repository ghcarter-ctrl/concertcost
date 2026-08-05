import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  buildSavingsPlan,
  formatWeeksLeft,
  type SavingsContribution,
  type SavingsGoal,
} from "@/lib/savings";
import { formatCurrency, formatNumber } from "@/lib/metrics";
import { sectionCardClass } from "@/lib/ui";

export async function SavingsDashboardTeaser() {
  const supabase = await createClient();
  const [{ data: goalsData }, { data: contribData }] = await Promise.all([
    supabase
      .from("savings_goals")
      .select("*")
      .eq("status", "active")
      .order("target_date", { ascending: true })
      .limit(3),
    supabase.from("savings_contributions").select("*"),
  ]);

  const goals = (goalsData ?? []) as SavingsGoal[];
  const contributions = (contribData ?? []) as SavingsContribution[];

  if (goals.length === 0) {
    return (
      <div className={`${sectionCardClass} animate-fade-up`}>
        <div className="card-body flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="card-title text-base">Concert Savings</h3>
            <p className="text-sm text-base-content/65">
              Planning a show? Set a target amount and get a weekly savings goal.
            </p>
          </div>
          <Link href="/savings" className="btn btn-primary btn-sm pressable">
            Start saving
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/55">
          Concert Savings
        </h3>
        <Link href="/savings" className="link link-primary text-sm">
          View all
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {goals.map((goal) => {
          const plan = buildSavingsPlan(
            goal,
            contributions.filter((c) => c.goal_id === goal.id)
          );
          return (
            <div key={goal.id} className={sectionCardClass}>
              <div className="card-body gap-2 py-4">
                <h4 className="font-semibold">{goal.concert_name}</h4>
                <p className="text-xs text-base-content/60">
                  {formatWeeksLeft(plan.weeksLeft, plan.daysLeft)} · weekly{" "}
                  {formatCurrency(plan.weeklyGoal)}
                </p>
                <progress
                  className="progress progress-primary h-2 w-full"
                  value={plan.progressPct}
                  max={100}
                />
                <p className="text-sm">
                  {formatCurrency(plan.savedTotal)} / {formatCurrency(Number(goal.target_amount))}{" "}
                  <span className="text-base-content/50">
                    ({formatNumber(plan.progressPct, 0)}%)
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
