import { ConcertForm } from "@/components/ConcertForm";

export default function AddConcertPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add Concert</h2>
        <p className="text-base-content/65">
          Fill in the show details, what you spent, and how fun it was. Your total updates as
          you type.
        </p>
      </div>
      <ConcertForm />
    </div>
  );
}
