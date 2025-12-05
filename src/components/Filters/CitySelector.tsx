import { useFilterStore } from "../../store/filterStore";
import { CITIES } from "../../utils/constants";

export function CitySelector() {
  const { cityId, setCityId } = useFilterStore();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">City</label>
      <select
        value={cityId}
        onChange={(e) => setCityId(Number(e.target.value))}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(CITIES).map(([id, city]) => (
          <option key={id} value={id}>
            {city.name} ({city.nameFA})
          </option>
        ))}
      </select>
    </div>
  );
}
