"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Car, MapPin, Clock, Zap, Warehouse } from "lucide-react";
import type { FakeParkingLot } from "@/lib/fakeParking";
import { formatCurrency } from "@/lib/metrics";
import { useToast } from "@/components/Toast";
import { primaryBtnClass, sectionCardClass, staggerClass } from "@/lib/ui";

type SortMode = "walk" | "price" | "early";

function addConcertHref(lot: FakeParkingLot): string {
  const params = new URLSearchParams({
    city: lot.city,
    state: lot.state,
    venue: lot.nearVenue,
    parking_cost: String(lot.priceEvent),
    distance_from_home: String(lot.distanceMiles),
    notes: `Parking: ${lot.name} (${formatCurrency(lot.priceEvent)} event rate)`,
  });
  return `/concerts/new?${params.toString()}`;
}

export function ParkingFinder() {
  const { showToast } = useToast();
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [lots, setLots] = useState<FakeParkingLot[]>([]);
  const [demoNote, setDemoNote] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("walk");
  const [coveredOnly, setCoveredOnly] = useState(false);
  const [evOnly, setEvOnly] = useState(false);

  const visibleLots = useMemo(() => {
    let list = [...lots];
    if (coveredOnly) list = list.filter((l) => l.covered);
    if (evOnly) list = list.filter((l) => l.evCharging);

    list.sort((a, b) => {
      if (sortMode === "price") return a.priceEvent - b.priceEvent || a.walkMinutes - b.walkMinutes;
      if (sortMode === "early")
        return a.priceEarlyBird - b.priceEarlyBird || a.walkMinutes - b.walkMinutes;
      return a.walkMinutes - b.walkMinutes || a.priceEvent - b.priceEvent;
    });
    return list;
  }, [lots, sortMode, coveredOnly, evOnly]);

  const cheapest = useMemo(() => {
    if (lots.length === 0) return null;
    return [...lots].sort((a, b) => a.priceEvent - b.priceEvent)[0];
  }, [lots]);

  const closest = useMemo(() => {
    if (lots.length === 0) return null;
    return [...lots].sort((a, b) => a.walkMinutes - b.walkMinutes)[0];
  }, [lots]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        city: city.trim(),
        stateCode: stateCode.trim(),
      });
      const res = await fetch(`/api/parking/search?${params.toString()}`);
      const data = (await res.json()) as {
        lots?: FakeParkingLot[];
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        const msg = data.error ?? "Search failed. Please try again.";
        setError(msg);
        setLots([]);
        setDemoNote(null);
        showToast(msg, "error");
        return;
      }

      setLots(data.lots ?? []);
      setDemoNote(data.message ?? null);
      showToast(`Found ${(data.lots ?? []).length} parking options nearby.`, "success");
    } catch {
      const msg = "Could not search right now. Check your connection and try again.";
      setError(msg);
      setLots([]);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className={`${sectionCardClass} animate-fade-up`}>
        <div className="card-body gap-4">
          <div>
            <h3 className="card-title text-lg">Search parking near venues</h3>
            <p className="text-sm text-base-content/60">
              Enter a city and state to compare sample event lots, walk times, and prices.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_8rem_auto]">
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">City</span>
              <input
                required
                className="input input-bordered w-full"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Nashville"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">State</span>
              <input
                required
                maxLength={2}
                className="input input-bordered w-full uppercase"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                placeholder="TN"
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className={`${primaryBtnClass} w-full`} disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Searching…
                  </>
                ) : (
                  "Find parking"
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

      {demoNote && lots.length > 0 ? (
        <div className="alert alert-info animate-fade-up py-2 text-sm">
          <Car className="h-4 w-4" />
          <span>{demoNote}</span>
        </div>
      ) : null}

      {lots.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 animate-fade-up">
            {closest ? (
              <div className={sectionCardClass}>
                <div className="card-body py-4">
                  <p className="text-xs uppercase tracking-wide text-base-content/50">Closest walk</p>
                  <p className="font-semibold">{closest.name}</p>
                  <p className="text-sm text-base-content/65">
                    {closest.walkMinutes} min walk · {formatCurrency(closest.priceEvent)} event rate
                  </p>
                </div>
              </div>
            ) : null}
            {cheapest ? (
              <div className={sectionCardClass}>
                <div className="card-body py-4">
                  <p className="text-xs uppercase tracking-wide text-base-content/50">Lowest event price</p>
                  <p className="font-semibold">{cheapest.name}</p>
                  <p className="text-sm text-base-content/65">
                    {formatCurrency(cheapest.priceEvent)} · {cheapest.walkMinutes} min walk
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-up">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn btn-sm ${sortMode === "walk" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setSortMode("walk")}
              >
                Sort: walk time
              </button>
              <button
                type="button"
                className={`btn btn-sm ${sortMode === "price" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setSortMode("price")}
              >
                Sort: event price
              </button>
              <button
                type="button"
                className={`btn btn-sm ${sortMode === "early" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setSortMode("early")}
              >
                Sort: early bird
              </button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={coveredOnly}
                  onChange={(e) => setCoveredOnly(e.target.checked)}
                />
                Covered only
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={evOnly}
                  onChange={(e) => setEvOnly(e.target.checked)}
                />
                EV charging
              </label>
            </div>
          </div>
        </>
      ) : null}

      {searched && !loading && !error && visibleLots.length === 0 ? (
        <div className={`${sectionCardClass} border-dashed animate-fade-up`}>
          <div className="card-body items-center text-center">
            <h3 className="card-title text-lg">No lots match your filters</h3>
            <p className="max-w-md text-base-content/70">
              Clear the filters or try another nearby city.
            </p>
          </div>
        </div>
      ) : null}

      {visibleLots.length > 0 ? (
        <div className="grid gap-4">
          {visibleLots.map((lot, index) => (
            <article key={lot.id} className={`${sectionCardClass} ${staggerClass(index)}`}>
              <div className="card-body gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="card-title text-lg">{lot.name}</h3>
                    <p className="flex items-center gap-1 text-sm text-base-content/60">
                      <MapPin className="h-3.5 w-3.5" />
                      {lot.address}, {lot.city}, {lot.state}
                    </p>
                    <p className="mt-1 text-sm text-base-content/70">Near {lot.nearVenue}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lot.covered ? (
                      <span className="badge badge-ghost gap-1">
                        <Warehouse className="h-3 w-3" /> Covered
                      </span>
                    ) : (
                      <span className="badge badge-ghost">Open air</span>
                    )}
                    {lot.evCharging ? (
                      <span className="badge badge-ghost gap-1">
                        <Zap className="h-3 w-3" /> EV
                      </span>
                    ) : null}
                    {lot.openOvernight ? (
                      <span className="badge badge-ghost">Overnight OK</span>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric
                    label="Event rate"
                    value={formatCurrency(lot.priceEvent)}
                    emphasize
                  />
                  <Metric label="Early bird" value={formatCurrency(lot.priceEarlyBird)} />
                  <Metric
                    label="Walk time"
                    value={`${lot.walkMinutes} min`}
                    icon={<Clock className="h-3.5 w-3.5 opacity-60" />}
                  />
                  <Metric label="Spots left" value={String(lot.spotsLeft)} />
                </div>

                <div className="rounded-box bg-base-200/70 p-3 text-sm text-base-content/80">
                  <span className="font-medium">Tip: </span>
                  {lot.tip}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={addConcertHref(lot)} className="btn btn-primary btn-sm pressable">
                    Use this parking on a concert
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      showToast(
                        `Early bird saves ${formatCurrency(lot.priceEvent - lot.priceEarlyBird)} vs event rate.`,
                        "info"
                      )
                    }
                  >
                    Compare savings
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  emphasize = false,
  icon,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-box bg-base-200/60 p-3">
      <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-base-content/50">
        {icon}
        {label}
      </div>
      <div className={`mt-1 font-semibold ${emphasize ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
