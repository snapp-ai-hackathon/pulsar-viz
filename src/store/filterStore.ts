import { create } from "zustand";
import { DEFAULT_SERVICE_TYPE, DEFAULT_CITY_ID, CITIES } from "../utils/constants";

interface FilterState {
  serviceType: number;
  cityId: number;
  viewport: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  setServiceType: (serviceType: number) => void;
  setCityId: (cityId: number) => void;
  setViewport: (viewport: { longitude: number; latitude: number; zoom: number }) => void;
}

const defaultCity = CITIES[DEFAULT_CITY_ID];

export const useFilterStore = create<FilterState>((set) => ({
  serviceType: DEFAULT_SERVICE_TYPE,
  cityId: DEFAULT_CITY_ID,
  viewport: {
    longitude: defaultCity.center[0],
    latitude: defaultCity.center[1],
    zoom: defaultCity.zoom,
  },
  setServiceType: (serviceType) => set({ serviceType }),
  setCityId: (cityId) => {
    const city = CITIES[cityId as keyof typeof CITIES];
    if (city) {
      set({
        cityId,
        viewport: {
          longitude: city.center[0],
          latitude: city.center[1],
          zoom: city.zoom,
        },
      });
    }
  },
  setViewport: (viewport) => set({ viewport }),
}));
