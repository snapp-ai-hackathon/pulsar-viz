import { useCallback } from "react";
import Map, { NavigationControl } from "react-map-gl/mapbox";
import DeckGL from "@deck.gl/react";
import { H3HexagonLayer } from "@deck.gl/geo-layers";
import { useFilterStore } from "../../store/filterStore";
import { useHexagonData } from "../../hooks/useHexagonData";
import { surgeToColor } from "../../utils/colors";
import type { HexagonWithForecast } from "../../api";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function SurgeMap() {
  const { serviceType, viewport, setViewport } = useFilterStore();
  const { data: hexagons, isLoading } = useHexagonData(serviceType);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onViewStateChange = useCallback(
    ({ viewState }: any) => {
      if (viewState?.longitude !== undefined) {
        setViewport({
          longitude: viewState.longitude,
          latitude: viewState.latitude,
          zoom: viewState.zoom,
        });
      }
    },
    [setViewport]
  );

  const layers = [
    new H3HexagonLayer<HexagonWithForecast>({
      id: "surge-hexagons",
      data: hexagons,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: false,
      opacity: 0.7,
      getHexagon: (d) => d.hexagon,
      getFillColor: (d) => surgeToColor(d.surge_delta_percent),
      getLineColor: [255, 255, 255, 100],
      lineWidthMinPixels: 1,
      onClick: (info) => {
        if (info.object) {
          const hex = info.object as HexagonWithForecast;
          console.log("Clicked hexagon:", {
            hexagon: hex.hexagon,
            surge: `${hex.surge_delta_percent.toFixed(1)}%`,
            confidence: `${(hex.confidence * 100).toFixed(0)}%`,
            demand: hex.demand.toFixed(1),
            driverGap: hex.driver_gap.toFixed(1),
          });
        }
      },
    }),
  ];

  return (
    <div className="relative w-full h-full">
      <DeckGL
        initialViewState={{
          longitude: viewport.longitude,
          latitude: viewport.latitude,
          zoom: viewport.zoom,
          pitch: 0,
          bearing: 0,
        }}
        controller={true}
        layers={layers}
        onViewStateChange={onViewStateChange}
      >
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
        />
        <NavigationControl position="top-right" />
      </DeckGL>

      {isLoading && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
          Loading hexagon data...
        </div>
      )}

      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white p-8">
            <h2 className="text-xl font-bold mb-2">Mapbox Token Required</h2>
            <p className="text-gray-400">
              Please set VITE_MAPBOX_TOKEN in your .env.local file
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
