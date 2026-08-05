"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import type { DiscoveredEvent } from "@/lib/ticketmaster";
import { formatDate } from "@/lib/metrics";
import { primaryBtnClass, sectionCardClass, staggerClass } from "@/lib/ui";
import { useToast } from "@/components/Toast";

function buildAddHref(event: DiscoveredEvent): string {
  const params = new URLSearchParams({
    concert_name: event.name,
    artist: event.artist,
    venue: event.venue,
    city: event.city,
    state: event.state,
    concert_date: event.date,
    from: "discover",
  });
  return `/concerts/new?${params.toString()}`;
}

export function DiscoverSearch() {
  const { showToast } = useToast();
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [events, setEvents] = useState<DiscoveredEvent[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({ city: city.trim() });
      if (stateCode.trim()) params.set("stateCode", stateCode.trim());

      const res = await fetch(`/api/events/search?${params.toString()}`);
      const data = (await res.json()) as { events?: DiscoveredEvent[]; error?: string };

      if (!res.ok) {
        const msg = data.error ?? "Search failed. Please try again.";
        setError(msg);
        setEvents([]);
        showToast(msg, "error");
        return;
      }

      setEvents(data.events ?? []);
      if ((data.events ?? []).length === 0) {
        showToast("No upcoming music events found for that city.", "info");
      }
    } catch {
      const msg = "Could not search right now. Check your connection and try again.";
      setError(msg);
      setEvents([]);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSearch}
        className={`${sectionCardClass} animate-fade-up`}
      >
        <div className="card-body gap-4">
          <div>
            <h3 className="card-title text-lg">Search by city</h3>
            <p className="text-sm text-base-content/60">
              Find upcoming music shows, then log one into your tracker.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_6rem_auto]">
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">City</span>
              <input
                required
                className="input input-bordered w-full"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Chicago"
                autoComplete="address-level2"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">State</span>
              <input
                className="input input-bordered w-full uppercase"
                value={stateCode}
                maxLength={2}
                onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                placeholder="IL"
                autoComplete="address-level1"
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className={`${primaryBtnClass} w-full sm:w-auto`} disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Searching…
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {error ? (
        <div className="alert alert-error animate-fade-up">
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-box border border-base-300/60 bg-base-100 p-4">
              <div className="skeleton mb-2 h-5 w-2/3" />
              <div className="skeleton mb-2 h-4 w-1/2" />
              <div className="skeleton h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && searched && !error && events.length === 0 ? (
        <div className={`${sectionCardClass} animate-fade-up`}>
          <div className="card-body items-center text-center">
            <Search className="h-8 w-8 text-base-content/40" />
            <h3 className="card-title text-lg">No shows found</h3>
            <p className="max-w-md text-base-content/70">
              Try another city spelling, or add a state code (like TX) to narrow results.
            </p>
          </div>
        </div>
      ) : null}

      {!loading && events.length > 0 ? (
        <div className="grid gap-3">
          {events.map((event, index) => (
            <article
              key={event.id}
              className={`${sectionCardClass} card-lift border-l-4 border-l-secondary ${staggerClass(index)}`}
            >
              <div className="card-body gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold leading-tight">{event.name}</h3>
                    <p className="text-base-content/70">{event.artist}</p>
                    <p className="mt-1 text-sm text-base-content/60">
                      {event.venue}
                      {event.city ? ` · ${event.city}` : ""}
                      {event.state ? `, ${event.state}` : ""}
                    </p>
                  </div>
                  {event.date ? (
                    <div className="badge badge-outline badge-lg">{formatDate(event.date)}</div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={buildAddHref(event)} className={`${primaryBtnClass} btn-sm`}>
                    Log this show
                  </Link>
                  {event.ticketUrl ? (
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm gap-1 pressable"
                    >
                      Tickets
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
