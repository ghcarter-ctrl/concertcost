import { TicketFinder } from "@/components/TicketFinder";
import { pageSubtitleClass, pageTitleClass } from "@/lib/ui";

export default function FindTicketsPage() {
  return (
    <div className="section-stack">
      <div className="animate-fade-in">
        <h2 className={pageTitleClass}>Find Tickets</h2>
        <p className={pageSubtitleClass}>
          Search by city and state to browse upcoming sample shows near you — then log a concert or
          start saving.
        </p>
      </div>
      <TicketFinder />
    </div>
  );
}
