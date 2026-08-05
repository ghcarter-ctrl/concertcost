export type FakeTicket = {
  id: string;
  eventName: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  date: string; // YYYY-MM-DD
  time: string;
  section: string;
  price: number;
  fees: number;
  available: number;
  distanceMiles: number;
};

const ARTISTS = [
  "Neon Harbor",
  "The Weekend Warriors",
  "Indigo Static",
  "Copper Line",
  "Velvet Circuit",
  "Riverlight Choir",
  "Northbound Echo",
  "Solar Parade",
  "Midnight Atlas",
  "Golden Hour Band",
  "Blue Canyon",
  "Paper Lanterns",
];

const VENUE_TYPES = [
  "Arena",
  "Amphitheatre",
  "Music Hall",
  "Pavilion",
  "Theater",
  "Stadium",
  "Ballroom",
  "Outdoor Stage",
];

const SECTIONS = [
  "Floor A",
  "Lower Bowl 110",
  "Lower Bowl 118",
  "Mezzanine C",
  "Balcony 2",
  "GA Pit",
  "Club Level",
  "Lawn",
];

const EVENT_SUFFIXES = [
  "Live",
  "Tour Stop",
  "Night One",
  "Hometown Show",
  "Summer Session",
  "Acoustic Set",
  "Festival Side Stage",
  "After Dark",
];

/** Simple deterministic hash so the same city/state returns the same tickets. */
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, list: T[]): T {
  return list[Math.floor(rand() * list.length) % list.length];
}

function formatDateUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function titleCaseCity(city: string): string {
  return city
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Generate realistic-looking sample tickets near a city/state.
 * Data is fake/demo-only — no real ticket inventory.
 */
export function generateFakeTickets(cityInput: string, stateInput: string): FakeTicket[] {
  const city = titleCaseCity(cityInput);
  const state = stateInput.trim().toUpperCase();
  const seed = hashString(`${city}|${state}`.toLowerCase());
  const rand = mulberry32(seed);

  const count = 6 + Math.floor(rand() * 5); // 6–10 results
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12));

  const tickets: FakeTicket[] = [];

  for (let i = 0; i < count; i++) {
    const artist = pick(rand, ARTISTS);
    const venue = `${city} ${pick(rand, VENUE_TYPES)}`;
    const daysOut = 7 + Math.floor(rand() * 90); // 1–13 weeks out
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() + daysOut);

    const hour = 18 + Math.floor(rand() * 4); // 6–9pm
    const minute = pick(rand, ["00", "30"]);
    const base = 45 + Math.floor(rand() * 180);
    const fees = Math.round(base * (0.12 + rand() * 0.1) * 100) / 100;
    const price = Math.round(base * 100) / 100;

    tickets.push({
      id: `ft-${seed.toString(16)}-${i}`,
      eventName: `${artist}: ${pick(rand, EVENT_SUFFIXES)}`,
      artist,
      venue,
      city,
      state,
      date: formatDateUTC(date),
      time: `${hour}:${minute}`,
      section: pick(rand, SECTIONS),
      price,
      fees,
      available: 2 + Math.floor(rand() * 18),
      distanceMiles: Math.round((3 + rand() * 35) * 10) / 10,
    });
  }

  return tickets.sort((a, b) => a.date.localeCompare(b.date) || a.price - b.price);
}

export function ticketTotal(ticket: FakeTicket): number {
  return Math.round((ticket.price + ticket.fees) * 100) / 100;
}
