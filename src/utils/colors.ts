type RGBA = [number, number, number, number];

/**
 * Maps surge_delta_percent (-20% to +80%) to a color.
 * Light colors = low surge (oversupply)
 * Orange/Dark = high surge (undersupply)
 */
export function surgeToColor(surgeDelta: number): RGBA {
  // Normalize to 0-1 range: -20..80 -> 0..1
  const normalized = Math.max(0, Math.min(1, (surgeDelta + 20) / 100));

  if (normalized < 0.2) return [255, 235, 210, 180]; // Very light peach - low surge
  if (normalized < 0.4) return [255, 210, 160, 190]; // Light orange
  if (normalized < 0.5) return [255, 180, 100, 200]; // Soft orange (neutral)
  if (normalized < 0.6) return [255, 150, 50, 210]; // Medium orange
  if (normalized < 0.7) return [255, 120, 0, 220]; // Bright orange
  if (normalized < 0.85) return [200, 80, 0, 230]; // Dark orange
  return [140, 50, 0, 240]; // Very dark orange/brown - high surge
}

/**
 * Color scale for the legend
 */
export const SURGE_COLOR_SCALE = [
  { value: -20, color: "rgb(255, 235, 210)", label: "-20%" },
  { value: 0, color: "rgb(255, 210, 160)", label: "0%" },
  { value: 20, color: "rgb(255, 180, 100)", label: "20%" },
  { value: 40, color: "rgb(255, 150, 50)", label: "40%" },
  { value: 60, color: "rgb(255, 120, 0)", label: "60%" },
  { value: 80, color: "rgb(140, 50, 0)", label: "80%+" },
];
