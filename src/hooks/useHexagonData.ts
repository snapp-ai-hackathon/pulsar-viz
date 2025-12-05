import { useQuery } from "@tanstack/react-query";
import { fetchHexagons, fetchBulkForecast } from "../api";
import type { HexagonWithForecast } from "../api";

export function useHexagonData(serviceType: number) {
  // First, fetch the list of hexagons
  const hexagonsQuery = useQuery({
    queryKey: ["hexagons", serviceType],
    queryFn: () => fetchHexagons(serviceType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Then, fetch forecasts for all hexagons
  const forecastsQuery = useQuery({
    queryKey: ["forecasts", serviceType, hexagonsQuery.data?.length],
    queryFn: async () => {
      if (!hexagonsQuery.data || hexagonsQuery.data.length === 0) {
        return [];
      }

      const hexagonIds = hexagonsQuery.data.map((h) => h.hexagon);

      // Batch requests in chunks of 500
      const chunkSize = 500;
      const chunks: string[][] = [];
      for (let i = 0; i < hexagonIds.length; i += chunkSize) {
        chunks.push(hexagonIds.slice(i, i + chunkSize));
      }

      const results = await Promise.all(
        chunks.map((chunk) =>
          fetchBulkForecast({
            hexagons: chunk,
            service_type: serviceType,
            horizons: [30],
          })
        )
      );

      return results.flat();
    },
    enabled: !!hexagonsQuery.data && hexagonsQuery.data.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Combine hexagon info with forecast data
  const hexagonsWithForecast: HexagonWithForecast[] = [];

  if (hexagonsQuery.data && forecastsQuery.data) {
    const forecastMap = new Map(
      forecastsQuery.data.map((f) => [f.hexagon, f])
    );

    for (const hex of hexagonsQuery.data) {
      const forecast = forecastMap.get(hex.hexagon);
      if (forecast) {
        hexagonsWithForecast.push({
          hexagon: hex.hexagon,
          service_type: hex.service_type,
          surge_delta_percent: forecast.surge_delta_percent,
          confidence: forecast.confidence,
          demand: forecast.demand,
          driver_gap: forecast.driver_gap,
        });
      }
    }
  }

  return {
    data: hexagonsWithForecast,
    isLoading: hexagonsQuery.isLoading || forecastsQuery.isLoading,
    isError: hexagonsQuery.isError || forecastsQuery.isError,
    error: hexagonsQuery.error || forecastsQuery.error,
  };
}
