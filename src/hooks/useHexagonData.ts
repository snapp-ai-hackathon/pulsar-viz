import { useQuery } from "@tanstack/react-query";
import { fetchHexagons, fetchBulkForecast } from "../api";
import type { HexagonWithForecast } from "../api";

export function useHexagonData(serviceType: number) {
  // Fetch the list of hexagons
  const hexagonsQuery = useQuery({
    queryKey: ["hexagons", serviceType],
    queryFn: () => fetchHexagons(serviceType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch forecasts for all hexagons
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

  // Map forecast data directly to HexagonWithForecast format
  const hexagonsWithForecast: HexagonWithForecast[] = (forecastsQuery.data ?? []).map((f) => ({
    hexagon: f.hexagon,
    service_type: f.service_type,
    surge_delta_percent: f.surge_delta_percent,
    confidence: f.confidence,
    demand: f.demand,
    driver_gap: f.driver_gap,
  }));

  return {
    data: hexagonsWithForecast,
    isLoading: hexagonsQuery.isLoading || forecastsQuery.isLoading,
    isError: hexagonsQuery.isError || forecastsQuery.isError,
    error: hexagonsQuery.error || forecastsQuery.error,
  };
}
