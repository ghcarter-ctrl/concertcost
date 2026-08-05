import { formatCurrency, formatNumber } from "@/lib/metrics";

export type SavingsGoal = {
  id: string;
  user_id: string;
  concert_name: string;
  target_amount: number;
  target_date: string;
  starting_saved: number;
  status: "active" | "completed" | "paused";
  notes: string | null;
  created_at: string;
};

export type SavingsContribution = {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  contributed_on: string;
  note: string | null;
  created_at: string;
};

export type SavingsPace = "ahead" | "on_track" | "behind" | "done" | "overdue";

export type SavingsPlan = {
  savedTotal: number;
  remaining: number;
  progressPct: number;
  daysLeft: number;
  weeksLeft: number;
  weeklyGoal: number;
  weeklyGoalWithBuffer: number;
  expectedSavedByNow: number;
  pace: SavingsPace;
  paceLabel: string;
  tip: string;
};

function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12));
}

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12));
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function getSavedTotal(
  goal: Pick<SavingsGoal, "starting_saved">,
  contributions: Pick<SavingsContribution, "amount">[]
): number {
  const deposits = contributions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  return Math.max(0, Number(goal.starting_saved) || 0) + deposits;
}

export function buildSavingsPlan(
  goal: SavingsGoal,
  contributions: SavingsContribution[],
  averageConcertCost: number | null = null
): SavingsPlan {
  const savedTotal = getSavedTotal(goal, contributions);
  const target = Math.max(0, Number(goal.target_amount) || 0);
  const remaining = Math.max(0, target - savedTotal);
  const progressPct = target > 0 ? Math.min(100, (savedTotal / target) * 100) : 0;

  const start = parseDateOnly(goal.created_at.slice(0, 10));
  const targetDate = parseDateOnly(goal.target_date);
  const today = todayUtc();

  const totalDays = Math.max(1, daysBetween(start, targetDate));
  const daysElapsed = Math.max(0, daysBetween(start, today));
  const daysLeft = daysBetween(today, targetDate);
  const weeksLeft = Math.max(1, Math.ceil(Math.max(daysLeft, 0) / 7));

  const weeklyGoal = remaining / weeksLeft;
  const weeklyGoalWithBuffer = weeklyGoal * 1.1;
  const expectedSavedByNow = target * Math.min(1, daysElapsed / totalDays);

  let pace: SavingsPace = "on_track";
  if (savedTotal >= target) pace = "done";
  else if (daysLeft < 0) pace = "overdue";
  else if (savedTotal >= expectedSavedByNow * 1.05) pace = "ahead";
  else if (savedTotal < expectedSavedByNow * 0.9) pace = "behind";

  const paceLabel =
    pace === "done"
      ? "Goal reached — you’re ready for the show"
      : pace === "overdue"
        ? "Concert date passed — finish funding if you still need it"
        : pace === "ahead"
          ? "Ahead of schedule — nice work"
          : pace === "behind"
            ? "A bit behind — a catch-up deposit will help"
            : "On track for show day";

  let tip = `Set aside ${formatCurrency(weeklyGoal)} each week to hit your goal.`;
  if (pace === "done") {
    tip = "You’re fully funded. Keep the money set aside until ticket day.";
  } else if (pace === "behind") {
    tip = `Try ${formatCurrency(weeklyGoalWithBuffer)} this week (10% buffer) to catch up.`;
  } else if (averageConcertCost && averageConcertCost > 0) {
    const avg = formatCurrency(averageConcertCost);
    tip =
      target > averageConcertCost * 1.2
        ? `This goal is higher than your usual concert spend (${avg}). Weekly auto-transfers help.`
        : `Close to your average concert cost (${avg}). Stay consistent each week.`;
  }

  return {
    savedTotal,
    remaining,
    progressPct,
    daysLeft,
    weeksLeft,
    weeklyGoal,
    weeklyGoalWithBuffer,
    expectedSavedByNow,
    pace,
    paceLabel,
    tip,
  };
}

export function formatWeeksLeft(weeksLeft: number, daysLeft: number): string {
  if (daysLeft < 0) return "Date passed";
  if (daysLeft === 0) return "Today";
  if (daysLeft < 7) return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  return `${weeksLeft} week${weeksLeft === 1 ? "" : "s"} left`;
}

export function paceBadgeClass(pace: SavingsPace): string {
  switch (pace) {
    case "done":
    case "ahead":
      return "badge-success";
    case "behind":
    case "overdue":
      return "badge-warning";
    default:
      return "badge-info";
  }
}

export { formatCurrency, formatNumber };
