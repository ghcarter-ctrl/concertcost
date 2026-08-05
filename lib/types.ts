export type Concert = {
  id: string;
  user_id: string;
  concert_name: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  concert_date: string;
  distance_from_home: number;
  hours_at_event: number;
  ticket_cost: number;
  ticket_fees: number;
  parking_cost: number;
  food_drink_cost: number;
  merchandise_cost: number;
  lodging_cost: number;
  travel_cost: number;
  other_cost: number;
  fun_rating: number;
  notes: string | null;
  created_at: string;
};

export type ConcertCosts = Pick<
  Concert,
  | "ticket_cost"
  | "ticket_fees"
  | "parking_cost"
  | "food_drink_cost"
  | "merchandise_cost"
  | "lodging_cost"
  | "travel_cost"
  | "other_cost"
>;

export const COST_FIELDS = [
  { key: "ticket_cost" as const, label: "Ticket cost" },
  { key: "ticket_fees" as const, label: "Ticket fees" },
  { key: "parking_cost" as const, label: "Parking cost" },
  { key: "food_drink_cost" as const, label: "Food and drink cost" },
  { key: "merchandise_cost" as const, label: "Merchandise cost" },
  { key: "lodging_cost" as const, label: "Hotel or lodging cost" },
  { key: "travel_cost" as const, label: "Travel or gas cost" },
  { key: "other_cost" as const, label: "Other cost" },
];

export const DAISY_THEMES = [
  "cupcake",
  "light",
  "dark",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
] as const;

export type DaisyTheme = (typeof DAISY_THEMES)[number];

/** Shortlist shown first in the theme picker */
export const FEATURED_THEMES: { id: DaisyTheme; label: string }[] = [
  { id: "cupcake", label: "Cupcake" },
  { id: "light", label: "Light" },
  { id: "night", label: "Night" },
  { id: "synthwave", label: "Synthwave" },
  { id: "emerald", label: "Emerald" },
  { id: "dracula", label: "Dracula" },
  { id: "nord", label: "Nord" },
  { id: "autumn", label: "Autumn" },
];
