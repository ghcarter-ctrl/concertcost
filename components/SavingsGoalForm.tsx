"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { formatCurrency } from "@/lib/metrics";
import { primaryBtnClass, sectionCardClass } from "@/lib/ui";

function weeksUntil(dateStr: string): number {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1, d, 12));
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12));
  const days = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil(Math.max(days, 0) / 7));
}

export function SavingsGoalForm({
  suggestedAmount,
}: {
  suggestedAmount?: number | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [concertName, setConcertName] = useState("");
  const [targetAmount, setTargetAmount] = useState(
    suggestedAmount && suggestedAmount > 0 ? String(Math.round(suggestedAmount)) : ""
  );
  const [targetDate, setTargetDate] = useState("");
  const [startingSaved, setStartingSaved] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewWeekly = useMemo(() => {
    const target = parseFloat(targetAmount) || 0;
    const already = parseFloat(startingSaved) || 0;
    const remaining = Math.max(0, target - already);
    const weeks = weeksUntil(targetDate);
    if (!target || !targetDate) return null;
    return { weeks, weekly: remaining / weeks, remaining };
  }, [targetAmount, startingSaved, targetDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const amount = parseFloat(targetAmount);
    if (!concertName.trim() || !targetDate || !Number.isFinite(amount) || amount <= 0) {
      setError("Enter a concert name, a target amount greater than 0, and a date.");
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be logged in.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("savings_goals").insert({
      user_id: user.id,
      concert_name: concertName.trim(),
      target_amount: amount,
      target_date: targetDate,
      starting_saved: Math.max(0, parseFloat(startingSaved) || 0),
      notes: notes.trim() || null,
      status: "active",
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      showToast(insertError.message, "error");
      return;
    }

    showToast("Savings goal created — here’s your weekly plan.", "success");
    setConcertName("");
    setTargetAmount(suggestedAmount && suggestedAmount > 0 ? String(Math.round(suggestedAmount)) : "");
    setTargetDate("");
    setStartingSaved("");
    setNotes("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={`${sectionCardClass} animate-fade-up`}>
      <div className="card-body gap-4">
        <div>
          <h3 className="card-title text-lg">Start a concert savings goal</h3>
          <p className="text-sm text-base-content/60">
            Enter what the show will cost and when it is. We’ll turn that into a weekly savings
            target.
          </p>
        </div>

        {error ? (
          <div className="alert alert-error py-2 text-sm">
            <span>{error}</span>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-control w-full sm:col-span-2">
            <span className="label-text mb-1 font-medium">Concert name</span>
            <input
              required
              className="input input-bordered w-full"
              value={concertName}
              onChange={(e) => setConcertName(e.target.value)}
              placeholder="Summer Stadium Tour"
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">Target amount</span>
            <label className="input input-bordered flex items-center gap-2">
              <span className="opacity-50">$</span>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                className="grow"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="250.00"
              />
            </label>
            {suggestedAmount && suggestedAmount > 0 ? (
              <span className="label-text-alt mt-1 text-base-content/50">
                Your average concert cost so far: {formatCurrency(suggestedAmount)}
              </span>
            ) : null}
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">Concert date</span>
            <input
              required
              type="date"
              className="input input-bordered w-full"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">Already saved (optional)</span>
            <label className="input input-bordered flex items-center gap-2">
              <span className="opacity-50">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="grow"
                value={startingSaved}
                onChange={(e) => setStartingSaved(e.target.value)}
                placeholder="0.00"
              />
            </label>
          </label>

          <label className="form-control w-full sm:col-span-2">
            <span className="label-text mb-1 font-medium">Notes (optional)</span>
            <input
              className="input input-bordered w-full"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Include merch + parking"
            />
          </label>
        </div>

        {previewWeekly ? (
          <div className="rounded-box bg-primary/10 px-4 py-3">
            <p className="text-sm font-medium text-primary">
              Weekly savings goal: {formatCurrency(previewWeekly.weekly)}
            </p>
            <p className="mt-1 text-xs text-base-content/65">
              {formatCurrency(previewWeekly.remaining)} left over about {previewWeekly.weeks} week
              {previewWeekly.weeks === 1 ? "" : "s"}.
            </p>
          </div>
        ) : null}

        <button type="submit" className={primaryBtnClass} disabled={saving}>
          {saving ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Creating…
            </>
          ) : (
            "Create savings goal"
          )}
        </button>
      </div>
    </form>
  );
}
