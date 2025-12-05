import { useCallback, useEffect, useMemo } from "react";
import { MapContainer, Polygon, TileLayer, Tooltip, ZoomControl, useMap } from "react-leaflet";
import { cellToBoundary } from "h3-js";
import { useFilterStore } from "../../store/filterStore";
import { useHexagonData } from "../../hooks/useHexagonData";
import { surgeToColor } from "../../utils/colors";
import { decimalToH3Hex } from "../../api";
import type { HexagonWithForecast } from "../../api";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

function ViewportSync({
  latitude,
  longitude,
  zoom,
  onViewportChange,
}: {
  latitude: number;
  longitude: number;
  zoom: number;
  onViewportChange: (viewport: { latitude: number; longitude: number; zoom: number }) => void;
}) {
  const map = useMap();

  // Keep the map view in sync when the store changes (e.g., city selection).
  useEffect(() => {
    map.setView([latitude, longitude], zoom, { animate: false });
  }, [latitude, longitude, zoom, map]);

  useEffect(() => {
    const handleMove = () => {
      const center = map.getCenter();
      const next = {
        latitude: center.lat,
        longitude: center.lng,
        zoom: map.getZoom(),
      };
      onViewportChange(next);
    };

    map.on("moveend", handleMove);
    map.on("zoomend", handleMove);
    return () => {
      map.off("moveend", handleMove);
      map.off("zoomend", handleMove);
    };
  }, [map, onViewportChange]);

  return null;
}

function SurgeHexagons({ hexagons }: { hexagons?: HexagonWithForecast[] }) {
  const polygons = useMemo(() => {
    if (!hexagons || hexagons.length === 0) {
      console.log("No hexagons to render");
      return [];
    }

    console.log(`Rendering ${hexagons.length} hexagons`);

    const validPolygons = hexagons
      .map((hex) => {
        try {
          // Ensure hexagon is a string
          const hexStr = String(hex.hexagon);
          
          if (!hexStr || hexStr === 'undefined' || hexStr === 'null') {
            console.warn("Invalid hexagon:", hex);
            return null;
          }

          // Convert decimal to hex
          let h3Index: string;
          try {
            h3Index = decimalToH3Hex(hexStr);
            
            if (!h3Index) {
              console.warn(`Failed to convert hexagon ${hexStr} to H3 hex`);
              return null;
            }
          } catch (error) {
            console.error(`Error converting hexagon ${hexStr} to hex:`, error);
            return null;
          }

          // Get boundary - h3-js accepts hex string
          let boundary: [number, number][];
          try {
            boundary = cellToBoundary(h3Index);
          } catch (error) {
            console.error(`Error getting boundary for H3 index ${h3Index} (from ${hexStr}):`, error);
            // Try using the decimal string directly as fallback
            try {
              console.log(`Trying decimal string directly: ${hexStr}`);
              boundary = cellToBoundary(hexStr);
            } catch (fallbackError) {
              console.error(`Fallback also failed:`, fallbackError);
              return null;
            }
          }
          
          if (!boundary || boundary.length === 0) {
            console.warn(`Empty boundary for hexagon ${hexStr} (H3: ${h3Index})`);
            return null;
          }

          const [r, g, b, a] = surgeToColor(hex.surge_delta_percent);
          const mappedBoundary = boundary.map(
            ([lat, lng]) => [lat, lng] as LatLngTuple
          );

          return {
            id: hexStr,
            boundary: mappedBoundary,
            fillColor: `rgb(${r}, ${g}, ${b})`,
            fillOpacity: a / 255,
            hex,
          };
        } catch (error) {
          console.error(`Error processing hexagon ${hex.hexagon}:`, error);
          return null;
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    console.log(`Successfully created ${validPolygons.length} polygons from ${hexagons.length} hexagons`);
    
    if (validPolygons.length === 0 && hexagons.length > 0) {
      console.error("No valid polygons created! Sample hexagon:", hexagons[0]);
    }

    return validPolygons;
  }, [hexagons]);

  // Debug: Log polygons before rendering
  useEffect(() => {
    if (polygons.length > 0) {
      console.log(`Rendering ${polygons.length} polygons on map`);
      console.log("Sample polygon:", {
        id: polygons[0].id,
        boundaryLength: polygons[0].boundary.length,
        firstPoint: polygons[0].boundary[0],
        fillColor: polygons[0].fillColor,
      });
    }
  }, [polygons.length]);

  if (polygons.length === 0) {
    return null;
  }

  return (
    <>
      {polygons.map(({ id, boundary, fillColor, fillOpacity, hex }) => {
        // Validate boundary before rendering
        if (!boundary || boundary.length === 0) {
          console.warn(`Skipping polygon with empty boundary: ${id}`);
          return null;
        }

        // Validate coordinates
        const hasValidCoords = boundary.every(
          ([lat, lng]) =>
            typeof lat === "number" &&
            typeof lng === "number" &&
            !isNaN(lat) &&
            !isNaN(lng) &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180
        );

        if (!hasValidCoords) {
          console.warn(`Skipping polygon with invalid coordinates: ${id}`);
          return null;
        }

        return (
          <Polygon
            key={id}
            positions={boundary}
            pathOptions={{
              color: "white",
              weight: 1,
              opacity: 0.5,
              fillColor,
              fillOpacity,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="text-sm">
                <div className="font-semibold mb-1">Hexagon {hex.hexagon}</div>
                <div>Surge: {hex.surge_delta_percent.toFixed(1)}%</div>
                <div>Confidence: {(hex.confidence * 100).toFixed(0)}%</div>
                <div>Demand: {hex.demand.toFixed(1)}</div>
                <div>Driver gap: {hex.driver_gap.toFixed(1)}</div>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}

export function SurgeMap() {
  const { serviceType, viewport, setViewport } = useFilterStore();
  const { data: hexagons, isLoading, isError, error } = useHexagonData(serviceType);

  // Debug logging
  useEffect(() => {
    const state = {
      count: hexagons?.length || 0,
      isLoading,
      isError,
      error: error instanceof Error ? error.message : String(error),
      sampleHexagon: hexagons?.[0],
    };
    console.log("SurgeMap - Hexagons state:", JSON.stringify(state, null, 2));
    
    if (isError) {
      console.error("API Error details:", error);
    }
    if (hexagons && hexagons.length > 0) {
      console.log(`✓ Loaded ${hexagons.length} hexagons`);
      console.log("First hexagon:", hexagons[0]);
    } else if (!isLoading && !isError) {
      console.warn("⚠ No hexagons loaded and no error - API might have returned empty array");
    }
  }, [hexagons?.length, isLoading, isError, error, hexagons]);

  const handleViewportChange = useCallback(
    (nextViewport: { latitude: number; longitude: number; zoom: number }) => {
      setViewport({
        latitude: nextViewport.latitude,
        longitude: nextViewport.longitude,
        zoom: nextViewport.zoom,
      });
    },
    [setViewport]
  );

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[viewport.latitude, viewport.longitude]}
        zoom={viewport.zoom}
        minZoom={3}
        className="w-full h-full"
        zoomControl={false}
        preferCanvas
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="topright" />
        <ViewportSync
          latitude={viewport.latitude}
          longitude={viewport.longitude}
          zoom={viewport.zoom}
          onViewportChange={handleViewportChange}
        />
        <SurgeHexagons hexagons={hexagons} />
      </MapContainer>

      {isLoading && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
          Loading hexagon data...
        </div>
      )}

      {/* Debug Info */}
      <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs z-50">
        <div className="font-semibold mb-1">Debug Info</div>
        <div>Hexagons: {hexagons?.length || 0}</div>
        <div>Loading: {isLoading ? "Yes" : "No"}</div>
        <div>Error: {isError ? "Yes" : "No"}</div>
        {hexagons && hexagons.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-[10px]">Sample ID: {String(hexagons[0]?.hexagon)}</div>
            <div className="text-[10px]">Type: {typeof hexagons[0]?.hexagon}</div>
          </div>
        )}
      </div>

      {isError && (
        <div className="absolute top-4 left-4 right-4 bg-red-900/90 text-white px-4 py-3 rounded-lg border border-red-700 shadow-lg">
          <p className="font-semibold">Failed to load surge data</p>
          <p className="text-sm text-red-100">
            {error instanceof Error ? error.message : "The backend did not respond."}
          </p>
        </div>
      )}
    </div>
  );
}
