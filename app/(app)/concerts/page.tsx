import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";
import { withMetrics } from "@/lib/metrics";
import { ConcertCard } from "@/components/ConcertCard";
import { EmptyState } from "@/components/StatCard";
import { pageSubtitleClass, pageTitleClass } from "@/lib/ui";

export default async function MyConcertsPage() {
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

  const concerts = ((data ?? []) as Concert[]).map(withMetrics);

  return (
    <div className="section-stack">
      <div className="animate-fade-in">
        <h2 className={pageTitleClass}>My Concerts</h2>
        <p className={pageSubtitleClass}>
          Every show you have logged, with totals and value scores.
        </p>
      </div>

      {concerts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {concerts.map((concert, index) => (
            <ConcertCard key={concert.id} concert={concert} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
