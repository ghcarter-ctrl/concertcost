"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Ticket } from "lucide-react";
import type { FakeTicket } from "@/lib/fakeTickets";
import { ticketTotal } from "@/lib/fakeTickets";
import { formatCurrency, formatDate } from "@/lib/metrics";
import { useToast } from "@/components/Toast";
import { primaryBtnClass, sectionCardClass, staggerClass } from "@/lib/ui";

function addConcertHref(ticket: FakeTicket): string {
  const params = new URLSearchParams({
    concert_name: ticket.eventName,
    artist: ticket.artist,
    venue: ticket.venue,
    city: ticket.city,
    state: ticket.state,
    concert_date: ticket.date,
    ticket_cost: String(ticket.price),
    ticket_fees: String(ticket.fees),
    distance_from_home: String(ticket.distanceMiles),
  });
  return `/concerts/new?${params.toString()}`;
}

function savingsHref(ticket: FakeTicket): string {
  const params = new URLSearchParams({
    concert_name: ticket.eventName,
    target_amount: String(ticketTotal(ticket)),
    target_date: ticket.date,
  });
  return `/savings?${params.toString()}`;
}

export function TicketFinder() {
  const { showToast } = useToast();
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [tickets, setTickets] = useState<FakeTicket[]>([]);
  const [demoNote, setDemoNote] = useState<string | null>(null);

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
      const res = await fetch(`/api/tickets/search?${params.toString()}`);
      const data = (await res.json()) as {
        tickets?: FakeTicket[];
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        const msg = data.error ?? "Search failed. Please try again.";
        setError(msg);
        setTickets([]);
        setDemoNote(null);
        showToast(msg, "error");
        return;
      }

      setTickets(data.tickets ?? []);
      setDemoNote(data.message ?? null);
      if ((data.tickets ?? []).length === 0) {
        showToast("No sample tickets found for that area.", "info");
      } else {
        showToast(`Found ${(data.tickets ?? []).length} upcoming shows nearby.`, "success");
      }
    } catch {
      const msg = "Could not search right now. Check your connection and try again.";
      setError(msg);
      setTickets([]);
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
            <h3 className="card-title text-lg">Search near you</h3>
            <p className="text-sm text-base-content/60">
              Enter a city and state to see upcoming sample ticket listings with dates and prices.
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
                placeholder="Austin"
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
                placeholder="TX"
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
                  "Find tickets"
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

      {demoNote && tickets.length > 0 ? (
        <div className="alert alert-info animate-fade-up py-2 text-sm">
          <Ticket className="h-4 w-4" />
          <span>{demoNote}</span>
        </div>
      ) : null}

      {searched && !loading && !error && tickets.length === 0 ? (
        <div className={`${sectionCardClass} border-dashed animate-fade-up`}>
          <div className="card-body items-center text-center">
            <h3 className="card-title text-lg">No tickets found</h3>
            <p className="max-w-md text-base-content/70">
              Try another nearby city or double-check the state code.
            </p>
          </div>
        </div>
      ) : null}

      {tickets.length > 0 ? (
        <div className="grid gap-4">
          {tickets.map((ticket, index) => (
            <article key={ticket.id} className={`${sectionCardClass} ${staggerClass(index)}`}>
              <div className="card-body gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="card-title text-lg">{ticket.eventName}</h3>
                    <p className="text-base-content/70">{ticket.artist}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-base-content/60">
                      <MapPin className="h-3.5 w-3.5" />
                      {ticket.venue} · {ticket.city}, {ticket.state} · {ticket.distanceMiles} mi
                    </p>
                  </div>
                  <div className="badge badge-outline badge-lg">
                    {formatDate(ticket.date)} · {ticket.time}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric label="Section" value={ticket.section} />
                  <Metric label="Ticket" value={formatCurrency(ticket.price)} />
                  <Metric label="Fees" value={formatCurrency(ticket.fees)} />
                  <Metric label="Total" value={formatCurrency(ticketTotal(ticket))} emphasize />
                </div>

                <p className="text-sm text-base-content/60">
                  {ticket.available} tickets left in this sample listing
                </p>

                <div className="flex flex-wrap gap-2">
                  <Link href={addConcertHref(ticket)} className="btn btn-primary btn-sm pressable">
                    Log this concert
                  </Link>
                  <Link href={savingsHref(ticket)} className="btn btn-outline btn-sm pressable">
                    Start savings goal
                  </Link>
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
