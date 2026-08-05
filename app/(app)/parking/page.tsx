import { ParkingFinder } from "@/components/ParkingFinder";
import { pageSubtitleClass, pageTitleClass } from "@/lib/ui";

export default function FindParkingPage() {
  return (
    <div className="section-stack">
      <div className="animate-fade-in">
        <h2 className={pageTitleClass}>Find Parking</h2>
        <p className={pageSubtitleClass}>
          Search by city and state to compare sample parking lots near venues — prices, walk time,
          and tips included.
        </p>
      </div>
      <ParkingFinder />
    </div>
  );
}
