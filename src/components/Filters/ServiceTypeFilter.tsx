import { useFilterStore } from "../../store/filterStore";
import { SERVICE_TYPES } from "../../utils/constants";

export function ServiceTypeFilter() {
  const { serviceType, setServiceType } = useFilterStore();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-300">Service Type</label>
      <select
        value={serviceType}
        onChange={(e) => setServiceType(Number(e.target.value))}
        className="bg-neutral-900 border border-orange-900/40 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        {SERVICE_TYPES.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name} ({type.nameFA})
          </option>
        ))}
      </select>
    </div>
  );
}
