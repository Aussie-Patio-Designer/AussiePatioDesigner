// Centralized Colorbond color palette extracted from official chart

export const COLORBOND_COLORS: Record<string, string> = {
  "Dover White": "#F8F8F4",
  "Surfmist": "#E4E3DC",
  "Southerly": "#D6D7D1",
  "Shale Grey": "#C1C2BE",
  "Bluegum": "#9CA0A3",
  "Windspray": "#898E8C",
  "Basalt": "#575B5D",
  "Classic Cream": "#F9E9C2",
  "Paperbark": "#D3C6A6",
  "Evening Haze": "#D5CDB1",
  "Dune": "#A89F91",
  "Gully": "#958B7C",
  "Jasper": "#78675A",
  "Manor Red": "#6A2E1F",
  "Wallaby": "#807E77",
  "Woodland Grey": "#4D4F45",
  "Pale Eucalypt": "#8C9C74",
  "Cottage Green": "#30523A",
  "Ironstone": "#434D56",
  "Deep Ocean": "#313944",
  "Monument": "#313233",
  "Night Sky": "#111112",
};

// Utility function for flexible color lookup
export function getColorbondHex(name: string): string {
  const normalized = name.toLowerCase().replace(/\s+/g, " ").trim();
  const key = Object.keys(COLORBOND_COLORS).find(
    k => k.toLowerCase().replace(/\s+/g, " ").trim() === normalized
  );
  return key ? COLORBOND_COLORS[key] : "#CCCCCC";
}
