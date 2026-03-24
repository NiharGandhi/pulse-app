export const BUSY_LEVELS = [
  { value: "dead", label: "Dead", emoji: "😴" },
  { value: "moderate", label: "Moderate", emoji: "👌" },
  { value: "packed", label: "Packed", emoji: "🔥" },
] as const;

export type BusyLevel = (typeof BUSY_LEVELS)[number]["value"];

export const VIBE_TAGS = [
  { value: "chill", label: "Chill" },
  { value: "lively", label: "Lively" },
  { value: "loud", label: "Loud" },
  { value: "romantic", label: "Romantic" },
] as const;

export type VibeTag = (typeof VIBE_TAGS)[number]["value"];

export const VIEW_STATUSES = [
  { value: "clear", label: "Clear view 🌆" },
  { value: "blocked", label: "Blocked" },
  { value: "na", label: "N/A" },
] as const;

export type ViewStatus = (typeof VIEW_STATUSES)[number]["value"];

// Inline styles for vibe tags — pastel light-theme palette.
// Used by VibeTag, PlaceCard, VibeSummaryBlock, CheckInsList.
// Keep in sync with VIBE_CONFIG in PlaceCard.tsx and search/page.tsx.
export const VIBE_TAG_STYLES: Record<
  string,
  { background: string; color: string }
> = {
  lively:       { background: "#EEFF99", color: "#4E6200" },
  chill:        { background: "#CCF0FF", color: "#005A75" },
  loud:         { background: "#FFE5CC", color: "#7A3000" },
  romantic:     { background: "#FFD6F0", color: "#7A004F" },
  packed:       { background: "#FFD6D6", color: "#7A0000" },
  moderate:     { background: "#FFF0CC", color: "#664800" },
  dead:         { background: "#EDEBE8", color: "#5A5450" },
  "view clear": { background: "#D6FFE8", color: "#005A2A" },
  view:         { background: "#D6FFE8", color: "#005A2A" },
};

export const SEARCH_EXAMPLE_PROMPTS = [
  "Lively rooftop in DIFC",
  "Quiet cafe to work in JBR",
  "Packed club in Business Bay",
  "Romantic dinner with Burj views",
  "Chill bar in Downtown",
];

export const DUBAI_AREAS = [
  "DIFC",
  "Downtown",
  "Business Bay",
  "JBR",
  "Dubai Marina",
  "Palm Jumeirah",
  "Jumeirah",
  "Al Quoz",
  "Deira",
  "Bur Dubai",
];
