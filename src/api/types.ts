export interface ForecastResult {
  hexagon: string; // H3 index as string to avoid precision loss
  service_type: number;
  horizon_min: number;
  demand: number;
  driver_gap: number;
  surge_delta_percent: number;
  confidence: number;
}

export interface HexagonInfo {
  hexagon: string;
  service_type: number;
}

export interface BulkForecastRequest {
  hexagons: string[];
  service_type: number;
  horizons: number[];
}

export interface HexagonWithForecast extends HexagonInfo {
  surge_delta_percent: number;
  confidence: number;
  demand: number;
  driver_gap: number;
}
