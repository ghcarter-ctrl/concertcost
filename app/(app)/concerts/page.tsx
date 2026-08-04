import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";
import { withMetrics } from "@/lib/metrics";
import { ConcertCard } from "@/components/ConcertCard";
import { EmptyState } from "@/components/StatCard";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Concerts</h2>
        <p className="text-base-content/65">
          Every show you have logged, with totals and value scores.
        </p>
      </div>

      {concerts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {concerts.map((concert) => (
            <ConcertCard key={concert.id} concert={concert} />
          ))}
        </div>
      )}
    </div>
  );
}
