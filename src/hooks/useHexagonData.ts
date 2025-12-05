import { useQuery } from "@tanstack/react-query";
import { fetchHexagons, fetchBulkForecast } from "../api";
import type { HexagonWithForecast, ForecastResult } from "../api";

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

      // Batch requests in chunks of 200
      // Process sequentially to avoid timeout issues
      const chunkSize = 200;
      const chunks: string[][] = [];
      for (let i = 0; i < hexagonIds.length; i += chunkSize) {
        chunks.push(hexagonIds.slice(i, i + chunkSize));
      }

      console.log(`[useHexagonData] Fetching forecasts for ${hexagonIds.length} hexagons in ${chunks.length} chunks`);

      // Process chunks sequentially instead of parallel to avoid timeout
      const results: ForecastResult[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
          console.log(`[useHexagonData] Processing chunk ${i + 1}/${chunks.length} (${chunk.length} hexagons)`);
          const chunkResults = await fetchBulkForecast({
            hexagons: chunk,
            service_type: serviceType,
            horizons: [30],
          });
          results.push(...chunkResults);
          console.log(`[useHexagonData] ✓ Chunk ${i + 1} completed: ${chunkResults.length} forecasts`);
        } catch (error) {
          console.error(`[useHexagonData] ✗ Chunk ${i + 1} failed:`, error);
          // Continue with other chunks even if one fails
        }
      }

      console.log(`[useHexagonData] ✓ Total forecasts received: ${results.length}`);
      return results;
    },
    enabled: !!hexagonsQuery.data && hexagonsQuery.data.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Map forecast data directly to HexagonWithForecast format
  // If forecasts fail or timeout, show hexagons with default values
  const forecastMap = new Map(
    (forecastsQuery.data ?? []).map((f) => [f.hexagon, f])
  );

  const hexagonsWithForecast: HexagonWithForecast[] = (hexagonsQuery.data ?? []).map((hex) => {
    const forecast = forecastMap.get(hex.hexagon);
    if (forecast) {
      return {
        hexagon: hex.hexagon,
        service_type: hex.service_type,
        surge_delta_percent: forecast.surge_delta_percent,
        confidence: forecast.confidence,
        demand: forecast.demand,
        driver_gap: forecast.driver_gap,
      };
    } else {
      // No forecast data - show hexagon with default values
      return {
        hexagon: hex.hexagon,
        service_type: hex.service_type,
        surge_delta_percent: 0,
        confidence: 0,
        demand: 0,
        driver_gap: 0,
      };
    }
  });

  // Debug logging
  const debugState = {
    hexagonsCount: hexagonsQuery.data?.length || 0,
    forecastsCount: forecastsQuery.data?.length || 0,
    hexagonsWithForecastCount: hexagonsWithForecast.length,
    hexagonsLoading: hexagonsQuery.isLoading,
    forecastsLoading: forecastsQuery.isLoading,
    hexagonsError: hexagonsQuery.isError,
    forecastsError: forecastsQuery.isError,
    forecastsEnabled: !!hexagonsQuery.data && hexagonsQuery.data.length > 0,
  };
  console.log("[useHexagonData] State:", JSON.stringify(debugState, null, 2));
  
  if (hexagonsQuery.data && hexagonsQuery.data.length > 0 && !forecastsQuery.isLoading && forecastsQuery.data?.length === 0) {
    console.warn("[useHexagonData] ⚠️ Hexagons loaded but no forecast data received!");
  }

  return {
    data: hexagonsWithForecast,
    isLoading: hexagonsQuery.isLoading || forecastsQuery.isLoading,
    isError: hexagonsQuery.isError || forecastsQuery.isError,
    error: hexagonsQuery.error || forecastsQuery.error,
  };
}
