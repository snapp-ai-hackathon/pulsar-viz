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
    if (!hexagons) return [];

    return hexagons.map((hex) => {
      const [r, g, b, a] = surgeToColor(hex.surge_delta_percent);
      const h3Index = decimalToH3Hex(hex.hexagon);
      const boundary = cellToBoundary(h3Index).map(
        ([lat, lng]) => [lat, lng] as LatLngTuple
      );

      return {
        id: hex.hexagon,
        boundary,
        fillColor: `rgb(${r}, ${g}, ${b})`,
        fillOpacity: a / 255,
        hex,
      };
    });
  }, [hexagons]);

  return (
    <>
      {polygons.map(({ id, boundary, fillColor, fillOpacity, hex }) => (
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
      ))}
    </>
  );
}

export function SurgeMap() {
  const { serviceType, viewport, setViewport } = useFilterStore();
  const { data: hexagons, isLoading, isError, error } = useHexagonData(serviceType);

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
