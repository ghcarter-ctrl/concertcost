import type { Concert, ConcertCosts } from "./types";
import { COST_FIELDS } from "./types";

export function getTotalCost(costs: ConcertCosts): number {
  return COST_FIELDS.reduce((sum, field) => sum + (Number(costs[field.key]) || 0), 0);
}

export function getCostPerHour(totalCost: number, hoursAtEvent: number): number | null {
  if (!hoursAtEvent || hoursAtEvent <= 0) return null;
  return totalCost / hoursAtEvent;
}

export function getFunPointsPer100(funRating: number, totalCost: number): number | null {
  if (!totalCost || totalCost <= 0) return null;
  return (funRating / totalCost) * 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  // Parse YYYY-MM-DD in UTC so server and browser always show the same calendar day.
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export type ConcertWithMetrics = Concert & {
  totalCost: number;
  costPerHour: number | null;
  funPointsPer100: number | null;
};

export function withMetrics(concert: Concert): ConcertWithMetrics {
  const totalCost = getTotalCost(concert);
  return {
    ...concert,
    totalCost,
    costPerHour: getCostPerHour(totalCost, Number(concert.hours_at_event)),
    funPointsPer100: getFunPointsPer100(Number(concert.fun_rating), totalCost),
  };
}

export type DashboardStats = {
  totalConcerts: number;
  totalSpent: number;
  averageCost: number | null;
  averageFun: number | null;
  averageCostPerHour: number | null;
  bestValue: ConcertWithMetrics | null;
  mostExpensive: ConcertWithMetrics | null;
  highestFun: ConcertWithMetrics | null;
  spendingByCategory: { name: string; amount: number }[];
};

export function computeDashboardStats(concerts: Concert[]): DashboardStats {
  const withMet = concerts.map(withMetrics);
  const totalConcerts = withMet.length;
  const totalSpent = withMet.reduce((sum, c) => sum + c.totalCost, 0);
  const averageCost = totalConcerts > 0 ? totalSpent / totalConcerts : null;
  const averageFun =
    totalConcerts > 0
      ? withMet.reduce((sum, c) => sum + Number(c.fun_rating), 0) / totalConcerts
      : null;

  const costPerHourValues = withMet
    .map((c) => c.costPerHour)
    .filter((v): v is number => v !== null);
  const averageCostPerHour =
    costPerHourValues.length > 0
      ? costPerHourValues.reduce((a, b) => a + b, 0) / costPerHourValues.length
      : null;

  const bestValue =
    withMet
      .filter((c) => c.funPointsPer100 !== null)
      .sort((a, b) => (b.funPointsPer100 ?? 0) - (a.funPointsPer100 ?? 0))[0] ?? null;

  const mostExpensive =
    [...withMet].sort((a, b) => b.totalCost - a.totalCost)[0] ?? null;

  const highestFun =
    [...withMet].sort((a, b) => Number(b.fun_rating) - Number(a.fun_rating))[0] ?? null;

  const spendingByCategory = COST_FIELDS.map((field) => ({
    name: field.label.replace(" cost", "").replace("Hotel or lodging", "Lodging"),
    amount: withMet.reduce((sum, c) => sum + (Number(c[field.key]) || 0), 0),
  })).filter((item) => item.amount > 0);

  return {
    totalConcerts,
    totalSpent,
    averageCost,
    averageFun,
    averageCostPerHour,
    bestValue,
    mostExpensive,
    highestFun,
    spendingByCategory,
  };
}
