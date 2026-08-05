import { DiscoverSearch } from "@/components/DiscoverSearch";
import { pageSubtitleClass, pageTitleClass } from "@/lib/ui";

export default function DiscoverPage() {
  return (
    <div className="section-stack">
      <div className="animate-fade-in">
        <h2 className={pageTitleClass}>Discover</h2>
        <p className={pageSubtitleClass}>
          Search upcoming music events by city, then log a show into your tracker.
        </p>
      </div>
      <DiscoverSearch />
    </div>
  );
}
