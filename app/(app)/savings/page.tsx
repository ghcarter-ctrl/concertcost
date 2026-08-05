import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";
import {
  type SavingsContribution,
  type SavingsGoal,
} from "@/lib/savings";
import { getTotalCost } from "@/lib/metrics";
import { SavingsGoalForm } from "@/components/SavingsGoalForm";
import { SavingsGoalCard } from "@/components/SavingsGoalCard";
import { pageSubtitleClass, pageTitleClass, sectionCardClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ConcertSavingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const prefill = {
    concert_name: first(params.concert_name),
    target_amount: first(params.target_amount),
    target_date: first(params.target_date),
  };
  const hasPrefill = Object.values(prefill).some((v) => v.trim().length > 0);

  const supabase = await createClient();

  const [{ data: goalsData, error: goalsError }, { data: contribData }, { data: concertsData }] =
    await Promise.all([
      supabase
        .from("savings_goals")
        .select("*")
        .order("target_date", { ascending: true }),
      supabase
        .from("savings_contributions")
        .select("*")
        .order("contributed_on", { ascending: false }),
      supabase.from("concerts").select("*"),
    ]);

  if (goalsError) {
    return (
      <div className="alert alert-error">
        <span>Could not load savings goals: {goalsError.message}</span>
      </div>
    );
  }

  const goals = (goalsData ?? []) as SavingsGoal[];
  const contributions = (contribData ?? []) as SavingsContribution[];
  const concerts = (concertsData ?? []) as Concert[];

  const averageConcertCost =
    concerts.length > 0
      ? concerts.reduce((sum, c) => sum + getTotalCost(c), 0) / concerts.length
      : null;

  const active = goals.filter((g) => g.status === "active");
  const other = goals.filter((g) => g.status !== "active");

  const contribByGoal = new Map<string, SavingsContribution[]>();
  for (const c of contributions) {
    const list = contribByGoal.get(c.goal_id) ?? [];
    list.push(c);
    contribByGoal.set(c.goal_id, list);
  }

  return (
    <div className="section-stack">
      <div className="animate-fade-in">
        <h2 className={pageTitleClass}>Concert Savings</h2>
        <p className={pageSubtitleClass}>
          Set a show budget, get a weekly savings goal, and track deposits until you’re ready.
        </p>
      </div>

      <div className={`${sectionCardClass} animate-fade-up`}>
        <div className="card-body gap-2">
          <h3 className="card-title text-base">How it works</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-base-content/75">
            <li>Enter the concert cost and the show date.</li>
            <li>We split what’s left into a clear weekly savings amount.</li>
            <li>Log deposits as you save — we’ll tell you if you’re ahead or behind.</li>
          </ol>
        </div>
      </div>

      <SavingsGoalForm
        suggestedAmount={averageConcertCost}
        initialValues={hasPrefill ? prefill : undefined}
      />

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/55">
          Active goals
        </h3>
        {active.length === 0 ? (
          <div className={`${sectionCardClass} border-dashed`}>
            <div className="card-body items-center text-center">
              <h3 className="card-title text-lg">No active savings goals yet</h3>
              <p className="max-w-md text-base-content/70">
                Create a goal above for your next concert. We’ll calculate how much to set aside
                each week.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {active.map((goal, index) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                contributions={contribByGoal.get(goal.id) ?? []}
                averageConcertCost={averageConcertCost}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {other.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/55">
            Paused & completed
          </h3>
          <div className="grid gap-4">
            {other.map((goal, index) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                contributions={contribByGoal.get(goal.id) ?? []}
                averageConcertCost={averageConcertCost}
                index={index}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
