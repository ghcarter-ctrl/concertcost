export type DiscoveredEvent = {
  id: string;
  name: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  date: string; // YYYY-MM-DD for the form date input
  ticketUrl: string | null;
};

function pickArtist(event: Record<string, unknown>): string {
  const attractions =
    (event._embedded as { attractions?: { name?: string }[] } | undefined)?.attractions ??
    [];
  if (attractions[0]?.name) return attractions[0].name;
  return typeof event.name === "string" ? event.name : "Unknown artist";
}

function pickVenue(event: Record<string, unknown>): {
  venue: string;
  city: string;
  state: string;
} {
  const venues =
    (event._embedded as {
      venues?: {
        name?: string;
        city?: { name?: string };
        state?: { stateCode?: string };
      }[];
    } | undefined)?.venues ?? [];
  const v = venues[0];
  return {
    venue: v?.name ?? "TBA",
    city: v?.city?.name ?? "",
    state: v?.state?.stateCode ?? "",
  };
}

function pickDate(event: Record<string, unknown>): string {
  const dates = event.dates as
    | { start?: { localDate?: string; dateTime?: string } }
    | undefined;
  if (dates?.start?.localDate) return dates.start.localDate;
  if (dates?.start?.dateTime) return dates.start.dateTime.slice(0, 10);
  return "";
}

export function mapTicketmasterEvent(raw: Record<string, unknown>): DiscoveredEvent {
  const { venue, city, state } = pickVenue(raw);
  const url =
    typeof raw.url === "string"
      ? raw.url
      : typeof (raw as { url?: string }).url === "string"
        ? (raw as { url: string }).url
        : null;

  return {
    id: String(raw.id ?? crypto.randomUUID()),
    name: typeof raw.name === "string" ? raw.name : "Untitled event",
    artist: pickArtist(raw),
    venue,
    city,
    state,
    date: pickDate(raw),
    ticketUrl: url,
  };
}
