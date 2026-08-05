import { ConcertForm } from "@/components/ConcertForm";
import { pageSubtitleClass, pageTitleClass } from "@/lib/ui";

export default function AddConcertPage() {
  return (
    <div className="section-stack">
      <div className="animate-fade-in">
        <h2 className={pageTitleClass}>Add Concert</h2>
        <p className={pageSubtitleClass}>
          Fill in the show details, what you spent, and how fun it was. Your total updates as you
          type.
        </p>
      </div>
      <ConcertForm />
    </div>
  );
}
