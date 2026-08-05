import { COST_FIELDS } from "@/lib/types";
import type { ConcertWithMetrics } from "@/lib/metrics";
import { formatCurrency, formatDate, formatNumber } from "@/lib/metrics";
import { staggerClass } from "@/lib/ui";

export function ConcertCard({
  concert,
  index = 0,
}: {
  concert: ConcertWithMetrics;
  index?: number;
}) {
  const mainCosts = COST_FIELDS.map((field) => ({
    label: field.label.replace(" cost", ""),
    amount: Number(concert[field.key]) || 0,
  }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  return (
    <article
      className={`card card-lift border border-base-300/70 border-l-4 border-l-primary bg-base-100 shadow-sm ${staggerClass(index)}`}
    >
      <div className="card-body gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-display text-xl font-bold leading-tight">{concert.concert_name}</h3>
            <p className="text-base-content/70">{concert.artist}</p>
            <p className="mt-1 text-sm text-base-content/60">
              {concert.venue} · {concert.city}, {concert.state}
            </p>
          </div>
          <div className="badge badge-outline badge-lg">{formatDate(concert.concert_date)}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Total cost" value={formatCurrency(concert.totalCost)} emphasize />
          <Metric label="Fun rating" value={`${concert.fun_rating}/10`} />
          <Metric
            label="Cost per hour"
            value={
              concert.costPerHour === null ? "—" : formatCurrency(concert.costPerHour)
            }
          />
          <Metric
            label="Fun Points per $100"
            value={
              concert.funPointsPer100 === null
                ? "—"
                : formatNumber(concert.funPointsPer100, 2)
            }
          />
        </div>

        {mainCosts.length > 0 ? (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-base-content/70">
              Main cost categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {mainCosts.map((c) => (
                <span key={c.label} className="badge badge-ghost gap-1">
                  {c.label}: {formatCurrency(c.amount)}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {concert.notes ? (
          <div className="rounded-box bg-base-200/60 p-3 text-sm text-base-content/75">
            <span className="font-medium text-base-content/90">Notes: </span>
            {concert.notes}
          </div>
        ) : null}
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
