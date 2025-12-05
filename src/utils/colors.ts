type RGBA = [number, number, number, number];

/**
 * Maps surge_delta_percent (-20% to +80%) to a color.
 * Blue/Teal = negative surge (oversupply)
 * Green/Yellow = neutral
 * Orange/Red = high surge (undersupply)
 */
export function surgeToColor(surgeDelta: number): RGBA {
  // Normalize to 0-1 range: -20..80 -> 0..1
  const normalized = Math.max(0, Math.min(1, (surgeDelta + 20) / 100));

  if (normalized < 0.2) return [65, 182, 196, 200]; // Teal - negative surge
  if (normalized < 0.4) return [127, 205, 187, 200]; // Light green
  if (normalized < 0.5) return [199, 233, 180, 200]; // Yellow-green (neutral)
  if (normalized < 0.6) return [255, 237, 111, 200]; // Yellow
  if (normalized < 0.7) return [254, 178, 76, 200]; // Orange
  if (normalized < 0.85) return [252, 78, 42, 200]; // Red-orange
  return [227, 26, 28, 200]; // Red - high surge
}

/**
 * Color scale for the legend
 */
export const SURGE_COLOR_SCALE = [
  { value: -20, color: "rgb(65, 182, 196)", label: "-20%" },
  { value: 0, color: "rgb(127, 205, 187)", label: "0%" },
  { value: 20, color: "rgb(199, 233, 180)", label: "20%" },
  { value: 40, color: "rgb(255, 237, 111)", label: "40%" },
  { value: 60, color: "rgb(254, 178, 76)", label: "60%" },
  { value: 80, color: "rgb(227, 26, 28)", label: "80%+" },
];
