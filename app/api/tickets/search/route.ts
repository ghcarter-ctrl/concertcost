import { NextRequest, NextResponse } from "next/server";
import { generateFakeTickets } from "@/lib/fakeTickets";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim() ?? "";
  const stateCode = request.nextUrl.searchParams.get("stateCode")?.trim().toUpperCase() ?? "";

  if (!city) {
    return NextResponse.json({ error: "Please enter a city name." }, { status: 400 });
  }

  if (!stateCode) {
    return NextResponse.json(
      { error: "Please enter a 2-letter state code, like IL or TX." },
      { status: 400 }
    );
  }

  if (!/^[A-Z]{2}$/.test(stateCode)) {
    return NextResponse.json(
      { error: "State should be a 2-letter code, like IL or CA." },
      { status: 400 }
    );
  }

  // Small delay so the UI loading state feels intentional.
  await new Promise((r) => setTimeout(r, 350));

  const tickets = generateFakeTickets(city, stateCode);

  return NextResponse.json({
    tickets,
    city,
    stateCode,
    demo: true,
    message: "Sample ticket listings for demo purposes — not real inventory.",
  });
}
