import { AxiosError } from "axios";
import { apiClient } from "./client";
import type { HexagonInfo, ForecastResult, BulkForecastRequest } from "./types";

/**
 * Convert decimal H3 index to hexadecimal format.
 * Backend returns H3 indices as decimal strings (e.g., "613280337128062975")
 * but h3-js expects hexadecimal format (e.g., "882cf37a23fffff").
 */
export function decimalToH3Hex(decimalStr: string | number): string {
  try {
    // Convert to string first
    const str = String(decimalStr);
    
    if (!str || str === 'undefined' || str === 'null' || str === 'NaN') {
      console.error(`Invalid decimal string: ${decimalStr}`);
      throw new Error(`Invalid decimal string: ${decimalStr}`);
    }

    // Convert to BigInt and then to hex
    // h3-js expects hex string without '0x' prefix
    const hex = BigInt(str).toString(16);
    
    return hex;
  } catch (error) {
    console.error(`Error converting decimal to hex: ${decimalStr}`, error);
    throw error;
  }
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
      hexagon: String(hexagon),
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
  const url = `/hexagons`;
  console.log(`[API] Fetching hexagons from ${apiClient.defaults.baseURL}${url}`, params);
  
  try {
    const response = await apiClient.get<HexagonInfo[]>(url, { params });
    console.log(`[API] ✓ Received ${response.data?.length || 0} hexagons`);
    if (response.data && response.data.length > 0) {
      console.log(`[API] Sample hexagon:`, response.data[0]);
    }
    return response.data || [];
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`[API] ✗ Error fetching hexagons:`, {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
    });
    throw error;
  }
}

export async function fetchBulkForecast(
  request: BulkForecastRequest
): Promise<ForecastResult[]> {
  const url = "/forecast/bulk";
  console.log(`[API] Fetching forecasts for ${request.hexagons.length} hexagons from ${apiClient.defaults.baseURL}${url}`);
  
  try {
    const response = await apiClient.post<ForecastResult[]>(url, request, {
      timeout: 120000, // 120 seconds for bulk requests
    });
    console.log(`[API] ✓ Received ${response.data?.length || 0} forecasts`);
    const normalized = normalizeForecastResponse(response.data);
    console.log(`[API] ✓ Normalized to ${normalized.length} forecasts`);
    return normalized;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`[API] ✗ Error fetching forecasts:`, {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      hexagonsCount: request.hexagons.length,
    });
    throw error;
  }
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
