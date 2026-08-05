"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { COST_FIELDS } from "@/lib/types";
import { formatCurrency, getTotalCost } from "@/lib/metrics";
import { useToast } from "@/components/Toast";
import { friendlySaveError } from "@/lib/errors";
import { primaryBtnClass, sectionCardClass } from "@/lib/ui";

const emptyForm = {
  concert_name: "",
  artist: "",
  venue: "",
  city: "",
  state: "",
  concert_date: "",
  distance_from_home: "",
  hours_at_event: "",
  ticket_cost: "",
  ticket_fees: "",
  parking_cost: "",
  food_drink_cost: "",
  merchandise_cost: "",
  lodging_cost: "",
  travel_cost: "",
  other_cost: "",
  fun_rating: "7",
  notes: "",
};

function toNumber(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function ConcertForm({
  initialValues,
}: {
  initialValues?: Partial<typeof emptyForm>;
} = {}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState(() => ({ ...emptyForm, ...initialValues }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulseTotal, setPulseTotal] = useState(false);
  const prevTotal = useRef<number | null>(null);

  const totalCost = useMemo(
    () =>
      getTotalCost({
        ticket_cost: toNumber(form.ticket_cost),
        ticket_fees: toNumber(form.ticket_fees),
        parking_cost: toNumber(form.parking_cost),
        food_drink_cost: toNumber(form.food_drink_cost),
        merchandise_cost: toNumber(form.merchandise_cost),
        lodging_cost: toNumber(form.lodging_cost),
        travel_cost: toNumber(form.travel_cost),
        other_cost: toNumber(form.other_cost),
      }),
    [form]
  );

  useEffect(() => {
    if (prevTotal.current !== null && prevTotal.current !== totalCost) {
      setPulseTotal(true);
      const t = window.setTimeout(() => setPulseTotal(false), 450);
      prevTotal.current = totalCost;
      return () => window.clearTimeout(t);
    }
    prevTotal.current = totalCost;
  }, [totalCost]);

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const msg = "You need to be logged in to save a concert.";
      setError(msg);
      showToast(msg, "error");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("concerts").insert({
      user_id: user.id,
      concert_name: form.concert_name.trim(),
      artist: form.artist.trim(),
      venue: form.venue.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      concert_date: form.concert_date,
      distance_from_home: toNumber(form.distance_from_home),
      hours_at_event: toNumber(form.hours_at_event),
      ticket_cost: toNumber(form.ticket_cost),
      ticket_fees: toNumber(form.ticket_fees),
      parking_cost: toNumber(form.parking_cost),
      food_drink_cost: toNumber(form.food_drink_cost),
      merchandise_cost: toNumber(form.merchandise_cost),
      lodging_cost: toNumber(form.lodging_cost),
      travel_cost: toNumber(form.travel_cost),
      other_cost: toNumber(form.other_cost),
      fun_rating: Math.min(10, Math.max(1, Math.round(toNumber(form.fun_rating) || 1))),
      notes: form.notes.trim() || null,
    });

    setSaving(false);

    if (insertError) {
      const msg = friendlySaveError(insertError.message);
      setError(msg);
      showToast(msg, "error");
      return;
    }

    showToast("Concert saved! Nice work logging another show.", "success");
    setForm(emptyForm);
    router.refresh();
  }

  const totalBadge = (
    <div
      className={`rounded-box bg-primary/10 px-4 py-2 text-right ${pulseTotal ? "animate-soft-pulse" : ""}`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-primary/80">
        Total concert cost
      </div>
      <div className="text-2xl font-bold text-primary">{formatCurrency(totalCost)}</div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 md:pb-0">
      {error ? (
        <div className="alert alert-error animate-fade-up">
          <span>{error}</span>
        </div>
      ) : null}

      <section className={`${sectionCardClass} animate-fade-up`}>
        <div className="card-body gap-4">
          <div>
            <h2 className="card-title text-lg">Concert details</h2>
            <p className="text-sm text-base-content/60">
              Who played, where it was, and how far you traveled.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Concert name</span>
              <input
                required
                className="input input-bordered w-full"
                value={form.concert_name}
                onChange={(e) => update("concert_name", e.target.value)}
                placeholder="Summer Stadium Tour"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Artist or band</span>
              <input
                required
                className="input input-bordered w-full"
                value={form.artist}
                onChange={(e) => update("artist", e.target.value)}
                placeholder="The Weekend Warriors"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Venue</span>
              <input
                required
                className="input input-bordered w-full"
                value={form.venue}
                onChange={(e) => update("venue", e.target.value)}
                placeholder="Red Rocks Amphitheatre"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">City</span>
              <input
                required
                className="input input-bordered w-full"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Morrison"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">State</span>
              <input
                required
                className="input input-bordered w-full"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                placeholder="CO"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Concert date</span>
              <input
                required
                type="date"
                className="input input-bordered w-full"
                value={form.concert_date}
                onChange={(e) => update("concert_date", e.target.value)}
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Distance from home (miles)</span>
              <input
                required
                type="number"
                min="0"
                step="0.1"
                className="input input-bordered w-full"
                value={form.distance_from_home}
                onChange={(e) => update("distance_from_home", e.target.value)}
                placeholder="25"
              />
              <span className="label-text-alt mt-1 text-base-content/50">
                Rough estimate is fine.
              </span>
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Approximate hours at the event</span>
              <input
                required
                type="number"
                min="0"
                step="0.1"
                className="input input-bordered w-full"
                value={form.hours_at_event}
                onChange={(e) => update("hours_at_event", e.target.value)}
                placeholder="4"
              />
              <span className="label-text-alt mt-1 text-base-content/50">
                Used to calculate cost per hour.
              </span>
            </label>
            <label className="form-control w-full sm:col-span-2">
              <span className="label-text mb-1 font-medium">Notes</span>
              <textarea
                className="textarea textarea-bordered min-h-24 w-full"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Opening act was great. Traffic was rough."
              />
            </label>
          </div>
        </div>
      </section>

      <section className={`${sectionCardClass} animate-fade-up stagger-2`}>
        <div className="card-body gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="card-title text-lg">Costs</h2>
              <p className="text-sm text-base-content/60">
                Enter what you spent. Leave blank fields as zero.
              </p>
            </div>
            <div className="hidden sm:block">{totalBadge}</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {COST_FIELDS.map((field) => (
              <label key={field.key} className="form-control w-full">
                <span className="label-text mb-1 font-medium">{field.label}</span>
                <span className="input input-bordered flex items-center gap-2">
                  <span className="opacity-50" aria-hidden>
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="grow bg-transparent outline-none"
                    value={form[field.key]}
                    onChange={(e) => update(field.key, e.target.value)}
                    placeholder="0.00"
                  />
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionCardClass} animate-fade-up stagger-3`}>
        <div className="card-body gap-4">
          <div>
            <h2 className="card-title text-lg">Fun rating</h2>
            <p className="text-sm text-base-content/60">
              How much fun was it? 1 is Terrible Time. 10 is Best Time Ever.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-sm font-medium">
              <span>Terrible Time</span>
              <span className="badge badge-primary badge-lg">{form.fun_rating || "—"} / 10</span>
              <span>Best Time Ever</span>
            </div>

            <div
              role="group"
              aria-label="Fun rating from 1 to 10"
              className="grid grid-cols-5 gap-2 sm:grid-cols-10"
            >
              {Array.from({ length: 10 }, (_, i) => {
                const value = String(i + 1);
                const selected = form.fun_rating === value;
                return (
                  <button
                    key={value}
                    type="button"
                    className={`btn btn-sm h-10 min-h-10 pressable ${
                      selected ? "btn-primary shadow-md" : "btn-outline"
                    }`}
                    aria-pressed={selected}
                    onClick={() => update("fun_rating", value)}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="hidden flex-wrap gap-3 md:flex">
        <button type="submit" className={primaryBtnClass} disabled={saving}>
          {saving ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Saving…
            </>
          ) : (
            "Save concert"
          )}
        </button>
        <button
          type="button"
          className="btn btn-ghost pressable"
          disabled={saving}
          onClick={() => {
            setForm(emptyForm);
            setError(null);
          }}
        >
          Clear form
        </button>
      </div>

      {/* Sticky mobile footer */}
      <div className="fixed inset-x-0 bottom-[4.25rem] z-30 border-t border-base-300/70 bg-base-100/95 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          {totalBadge}
          <button type="submit" className={`${primaryBtnClass} shrink-0`} disabled={saving}>
            {saving ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
