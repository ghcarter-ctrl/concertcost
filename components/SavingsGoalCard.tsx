"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import {
  buildSavingsPlan,
  formatWeeksLeft,
  paceBadgeClass,
  type SavingsContribution,
  type SavingsGoal,
} from "@/lib/savings";
import { formatCurrency, formatDate, formatNumber } from "@/lib/metrics";
import { primaryBtnClass, sectionCardClass, staggerClass } from "@/lib/ui";

export function SavingsGoalCard({
  goal,
  contributions,
  averageConcertCost,
  index = 0,
}: {
  goal: SavingsGoal;
  contributions: SavingsContribution[];
  averageConcertCost?: number | null;
  index?: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const plan = buildSavingsPlan(goal, contributions, averageConcertCost ?? null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function logDeposit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      showToast("Enter a deposit amount greater than 0.", "error");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      showToast("You need to be logged in.", "error");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("savings_contributions").insert({
      goal_id: goal.id,
      user_id: user.id,
      amount: value,
      note: note.trim() || null,
    });

    if (error) {
      showToast(error.message, "error");
      setSaving(false);
      return;
    }

    const nextSaved = plan.savedTotal + value;
    if (nextSaved >= Number(goal.target_amount) && goal.status === "active") {
      await supabase
        .from("savings_goals")
        .update({ status: "completed" })
        .eq("id", goal.id)
        .eq("user_id", user.id);
      showToast("Goal funded — you’re ready for the show!", "success");
    } else {
      showToast(`Logged ${formatCurrency(value)} toward ${goal.concert_name}.`, "success");
    }

    setAmount("");
    setNote("");
    setSaving(false);
    router.refresh();
  }

  async function markComplete() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("savings_goals")
      .update({ status: "completed" })
      .eq("id", goal.id)
      .eq("user_id", user.id);
    showToast("Marked as completed.", "success");
    router.refresh();
  }

  async function pauseOrResume() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const next = goal.status === "paused" ? "active" : "paused";
    await supabase
      .from("savings_goals")
      .update({ status: next })
      .eq("id", goal.id)
      .eq("user_id", user.id);
    showToast(next === "paused" ? "Goal paused." : "Goal resumed.", "success");
    router.refresh();
  }

  const recent = [...contributions]
    .sort((a, b) => b.contributed_on.localeCompare(a.contributed_on))
    .slice(0, 4);

  return (
    <article className={`${sectionCardClass} ${staggerClass(index)}`}>
      <div className="card-body gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="card-title text-xl">{goal.concert_name}</h3>
            <p className="text-sm text-base-content/60">
              Target {formatCurrency(Number(goal.target_amount))} by {formatDate(goal.target_date)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`badge badge-outline`}>{formatWeeksLeft(plan.weeksLeft, plan.daysLeft)}</span>
            <span className={`badge ${paceBadgeClass(plan.pace)}`}>{plan.paceLabel}</span>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">{formatCurrency(plan.savedTotal)} saved</span>
            <span className="text-base-content/60">
              {formatNumber(plan.progressPct, 0)}% of {formatCurrency(Number(goal.target_amount))}
            </span>
          </div>
          <progress
            className="progress progress-primary h-3 w-full"
            value={plan.progressPct}
            max={100}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Weekly goal" value={formatCurrency(plan.weeklyGoal)} emphasize />
          <Metric label="With 10% buffer" value={formatCurrency(plan.weeklyGoalWithBuffer)} />
          <Metric label="Still needed" value={formatCurrency(plan.remaining)} />
          <Metric label="Deposits logged" value={String(contributions.length)} />
        </div>

        <div className="rounded-box bg-base-200/70 p-3 text-sm text-base-content/80">
          <span className="font-medium">Tip: </span>
          {plan.tip}
        </div>

        {goal.status === "active" ? (
          <form onSubmit={logDeposit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="form-control w-full">
              <span className="label-text mb-1 text-xs font-medium">Log a deposit</span>
              <label className="input input-bordered input-sm flex items-center gap-2">
                <span className="opacity-50">$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="grow"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={plan.weeklyGoal.toFixed(2)}
                  required
                />
              </label>
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1 text-xs font-medium">Note (optional)</span>
              <input
                className="input input-bordered input-sm w-full"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Paycheck transfer"
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className={`${primaryBtnClass} btn-sm w-full`} disabled={saving}>
                {saving ? "Saving…" : "Add"}
              </button>
            </div>
          </form>
        ) : null}

        {recent.length > 0 ? (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-base-content/70">Recent deposits</h4>
            <ul className="space-y-1.5 text-sm">
              {recent.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-box bg-base-200/50 px-3 py-2"
                >
                  <span>
                    {formatDate(c.contributed_on)}
                    {c.note ? ` · ${c.note}` : ""}
                  </span>
                  <span className="font-medium text-primary">+{formatCurrency(Number(c.amount))}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {goal.status === "active" ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={pauseOrResume}>
                Pause goal
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={markComplete}>
                Mark complete
              </button>
            </>
          ) : null}
          {goal.status === "paused" ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={pauseOrResume}>
              Resume goal
            </button>
          ) : null}
          {goal.status === "completed" ? (
            <span className="badge badge-success badge-lg">Completed</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-box bg-base-200/60 p-3">
      <div className="text-xs uppercase tracking-wide text-base-content/50">{label}</div>
      <div className={`mt-1 font-semibold ${emphasize ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
