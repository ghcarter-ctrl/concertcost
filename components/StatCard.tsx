import Link from "next/link";
import { Music2 } from "lucide-react";
import { formatCurrency } from "@/lib/metrics";

export function StatCard({
  title,
  value,
  hint,
  className = "",
}: {
  title: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={`stat rounded-box border border-base-300/70 bg-base-100 shadow-sm animate-fade-up ${className}`}
    >
      <div className="stat-title text-base-content/60">{title}</div>
      <div
        className="stat-value break-words text-xl leading-tight text-primary sm:text-2xl"
        title={value}
      >
        {value}
      </div>
      {hint ? <div className="stat-desc text-base-content/50">{hint}</div> : null}
    </div>
  );
}

export function HighlightCard({
  title,
  value,
  hint,
  className = "",
}: {
  title: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={`card border border-base-300/70 bg-base-100 shadow-sm animate-fade-up ${className}`}
    >
      <div className="card-body gap-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
          {title}
        </p>
        <p className="font-display text-xl font-bold leading-snug text-primary sm:text-2xl" title={value}>
          {value}
        </p>
        {hint ? <p className="text-sm text-base-content/60">{hint}</p> : null}
      </div>
    </div>
  );
}

export function EmptyState({
  message = "No concerts logged yet. Add your first concert to start seeing your dashboard.",
  actionHref = "/concerts/new",
  actionLabel = "Add a concert",
}: {
  message?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card border border-dashed border-base-300 bg-base-100/70 animate-fade-up">
      <div className="card-body items-center text-center">
        <div className="mb-1 rounded-box bg-primary/15 p-3 text-primary">
          <Music2 className="h-7 w-7" />
        </div>
        <h3 className="card-title text-lg">Nothing here yet</h3>
        <p className="max-w-md text-base-content/70">{message}</p>
        <Link href={actionHref} className="btn btn-primary mt-2 pressable">
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

export function moneyOrDash(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return formatCurrency(value);
}
