import { NextRequest, NextResponse } from "next/server";
import { mapTicketmasterEvent, type DiscoveredEvent } from "@/lib/ticketmaster";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Ticketmaster is not set up yet. Add TICKETMASTER_API_KEY to .env.local and restart the app.",
      },
      { status: 500 }
    );
  }

  const city = request.nextUrl.searchParams.get("city")?.trim() ?? "";
  const stateCode = request.nextUrl.searchParams.get("stateCode")?.trim().toUpperCase() ?? "";

  if (!city) {
    return NextResponse.json({ error: "Please enter a city name." }, { status: 400 });
  }

  if (stateCode && !/^[A-Z]{2}$/.test(stateCode)) {
    return NextResponse.json(
      { error: "State should be a 2-letter code, like IL or CA." },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    city,
    countryCode: "US",
    classificationName: "music",
    sort: "date,asc",
    size: "20",
  });
  if (stateCode) params.set("stateCode", stateCode);

  try {
    const res = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("Ticketmaster error", res.status, body.slice(0, 400));
      return NextResponse.json(
        {
          error:
            res.status === 401 || res.status === 403
              ? "Ticketmaster rejected the API key. Check TICKETMASTER_API_KEY in .env.local."
              : "Could not reach Ticketmaster right now. Try again in a moment.",
        },
        { status: 502 }
      );
    }

    const json = (await res.json()) as {
      _embedded?: { events?: Record<string, unknown>[] };
    };

    const events: DiscoveredEvent[] = (json._embedded?.events ?? []).map(mapTicketmasterEvent);

    return NextResponse.json({ events, city, stateCode: stateCode || null });
  } catch (err) {
    console.error("Ticketmaster fetch failed", err);
    return NextResponse.json(
      { error: "Network error talking to Ticketmaster. Check your connection and try again." },
      { status: 502 }
    );
  }
}
