import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SurgeMap } from "./components/Map/SurgeMap";
import { ServiceTypeFilter } from "./components/Filters/ServiceTypeFilter";
import { CitySelector } from "./components/Filters/CitySelector";
import { SurgeLegend } from "./components/Legend/SurgeLegend";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 p-4 flex flex-col gap-6 border-r border-gray-800">
          <header>
            <h1 className="text-xl font-bold text-white">Pulsar</h1>
            <p className="text-sm text-gray-400">Surge Prediction Map</p>
          </header>

          <div className="flex flex-col gap-4">
            <ServiceTypeFilter />
            <CitySelector />
          </div>

          <div className="mt-auto">
            <SurgeLegend />
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <SurgeMap />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
