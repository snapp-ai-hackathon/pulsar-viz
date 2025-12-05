import { apiClient } from "./client";
import type { HexagonInfo, ForecastResult, BulkForecastRequest } from "./types";

/**
 * Convert decimal H3 index to hexadecimal format.
 * Backend returns H3 indices as decimal strings (e.g., "613280337128062975")
 * but h3-js expects hexadecimal format (e.g., "882cf37a23fffff").
 */
function decimalToH3Hex(decimalStr: string): string {
  return BigInt(decimalStr).toString(16);
}

type RawSurgeDelta =
  | number
  | string
  | {
      source?: string | number;
      parsedValue?: number;
      value?: number;
    };

function normalizeSurgeDelta(value: RawSurgeDelta): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  if (value && typeof value === "object") {
    const candidate =
      typeof value.parsedValue === "number"
        ? value.parsedValue
        : typeof value.value === "number"
          ? value.value
          : value.source;

    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }

    if (typeof candidate === "string") {
      const parsed = parseFloat(candidate);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return 0;
}

function normalizeForecastResponse(payload: unknown): ForecastResult[] {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object"
      ? Object.values(payload as Record<string, unknown>)
      : [];

  const normalized: ForecastResult[] = [];

  for (const item of rawItems) {
    if (!item || typeof item !== "object") continue;
    const data = item as Record<string, unknown>;

    const hexagon = data.hexagon;
    if (!hexagon) continue;

    normalized.push({
      hexagon: decimalToH3Hex(String(hexagon)),
      service_type: Number(data.service_type ?? 0),
      horizon_min: Number(data.horizon_min ?? 0),
      demand: Number(data.demand ?? 0),
      driver_gap: Number(data.driver_gap ?? 0),
      surge_delta_percent: normalizeSurgeDelta(
        data.surge_delta_percent as RawSurgeDelta
      ),
      confidence: Number(data.confidence ?? 0),
    });
  }

  return normalized;
}

export async function fetchHexagons(
  serviceType?: number
): Promise<HexagonInfo[]> {
  const params = serviceType ? { service_type: serviceType } : {};
  const response = await apiClient.get<HexagonInfo[]>("/hexagons", { params });
  return response.data.map((hex) => ({
    ...hex,
    hexagon: decimalToH3Hex(hex.hexagon),
  }));
}

export async function fetchBulkForecast(
  request: BulkForecastRequest
): Promise<ForecastResult[]> {
  const response = await apiClient.post<ForecastResult[]>(
    "/forecast/bulk",
    request
  );
  return normalizeForecastResponse(response.data);
}

export async function fetchForecast(
  hexagon: string,
  serviceType: number,
  horizons: number[] = [30]
): Promise<ForecastResult[]> {
  const response = await apiClient.get<ForecastResult[]>("/forecast", {
    params: {
      hexagon,
      service_type: serviceType,
      horizons,
    },
  });
  return normalizeForecastResponse(response.data);
}
