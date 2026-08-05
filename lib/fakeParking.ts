export type FakeParkingLot = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  nearVenue: string;
  walkMinutes: number;
  distanceMiles: number;
  priceEvent: number;
  priceEarlyBird: number;
  spotsLeft: number;
  covered: boolean;
  evCharging: boolean;
  openOvernight: boolean;
  tip: string;
};

const LOT_PREFIXES = [
  "Venue",
  "Central",
  "Riverfront",
  "Downtown",
  "Gate",
  "Plaza",
  "Stadium",
  "Market",
  "Harbor",
  "Civic",
];

const LOT_SUFFIXES = [
  "Parking Garage",
  "Event Lot",
  "Park & Walk",
  "Deck",
  "Surface Lot",
  "Structure",
  "Lot B",
  "Overflow Lot",
];

const STREET_NAMES = [
  "Main St",
  "Commerce Ave",
  "Arena Way",
  "1st Ave",
  "Music Row",
  "Center Blvd",
  "Park Ave",
  "Venue Dr",
];

const VENUES = [
  "Arena",
  "Amphitheatre",
  "Music Hall",
  "Stadium",
  "Pavilion",
  "Theater",
];

const TIPS = [
  "Arrive 45+ minutes early — event rates can jump closer to showtime.",
  "Early-bird pricing usually ends 2 hours before doors.",
  "If you’re saving, pick the early-bird rate and log parking in your concert costs.",
  "Covered garages cost more but help in rain.",
  "Overflow lots are cheaper but add walk time after the show.",
];

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

function titleCaseCity(city: string): string {
  return city
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Deterministic sample parking lots for a city/state (demo data only). */
export function generateFakeParking(cityInput: string, stateInput: string): FakeParkingLot[] {
  const city = titleCaseCity(cityInput);
  const state = stateInput.trim().toUpperCase();
  const seed = hashString(`parking|${city}|${state}`.toLowerCase());
  const rand = mulberry32(seed);
  const count = 5 + Math.floor(rand() * 4); // 5–8 lots

  const lots: FakeParkingLot[] = [];

  for (let i = 0; i < count; i++) {
    const nearVenue = `${city} ${pick(rand, VENUES)}`;
    const walkMinutes = 3 + Math.floor(rand() * 18);
    const distanceMiles = Math.round((0.1 + walkMinutes * 0.05 + rand() * 0.4) * 100) / 100;
    const priceEvent = Math.round((12 + rand() * 38) * 2) / 2; // $12–$50
    const priceEarlyBird = Math.round(priceEvent * (0.55 + rand() * 0.2) * 2) / 2;
    const covered = rand() > 0.45;
    const evCharging = rand() > 0.7;
    const openOvernight = rand() > 0.35;

    lots.push({
      id: `fp-${seed.toString(16)}-${i}`,
      name: `${pick(rand, LOT_PREFIXES)} ${pick(rand, LOT_SUFFIXES)}`,
      address: `${100 + Math.floor(rand() * 800)} ${pick(rand, STREET_NAMES)}`,
      city,
      state,
      nearVenue,
      walkMinutes,
      distanceMiles,
      priceEvent,
      priceEarlyBird,
      spotsLeft: 8 + Math.floor(rand() * 90),
      covered,
      evCharging,
      openOvernight,
      tip: pick(rand, TIPS),
    });
  }

  // Best options first: shorter walk, then cheaper event price.
  return lots.sort(
    (a, b) => a.walkMinutes - b.walkMinutes || a.priceEvent - b.priceEvent
  );
}
