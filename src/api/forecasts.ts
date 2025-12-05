import { apiClient } from "./client";
import type {
  HexagonInfo,
  ForecastResult,
  BulkForecastRequest,
} from "./types";

export async function fetchHexagons(
  serviceType?: number
): Promise<HexagonInfo[]> {
  const params = serviceType ? { service_type: serviceType } : {};
  const response = await apiClient.get<HexagonInfo[]>("/hexagons", { params });
  return response.data;
}

export async function fetchBulkForecast(
  request: BulkForecastRequest
): Promise<ForecastResult[]> {
  const response = await apiClient.post<ForecastResult[]>(
    "/forecast/bulk",
    request
  );
  return response.data;
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
  return response.data;
}
