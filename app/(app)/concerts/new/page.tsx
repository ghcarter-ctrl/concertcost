import { ConcertForm } from "@/components/ConcertForm";
import { pageSubtitleClass, pageTitleClass } from "@/lib/ui";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AddConcertPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const initialValues = {
    concert_name: first(params.concert_name),
    artist: first(params.artist),
    venue: first(params.venue),
    city: first(params.city),
    state: first(params.state),
    concert_date: first(params.concert_date),
    ticket_cost: first(params.ticket_cost),
    ticket_fees: first(params.ticket_fees),
    distance_from_home: first(params.distance_from_home),
  };

  const hasPrefill = Object.values(initialValues).some((v) => v.trim().length > 0);

  return (
    <div className="section-stack">
      <div className="animate-fade-in">
        <h2 className={pageTitleClass}>Add Concert</h2>
        <p className={pageSubtitleClass}>
          Fill in the show details, what you spent, and how fun it was. Your total updates as you
          type.
        </p>
      </div>
      <ConcertForm initialValues={hasPrefill ? initialValues : undefined} />
    </div>
  );
}
