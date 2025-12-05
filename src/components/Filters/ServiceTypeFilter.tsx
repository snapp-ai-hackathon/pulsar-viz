import { useFilterStore } from "../../store/filterStore";
import { SERVICE_TYPES } from "../../utils/constants";

export function ServiceTypeFilter() {
  const { serviceType, setServiceType } = useFilterStore();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-800">Service Type</label>
      <select
        value={serviceType}
        onChange={(e) => setServiceType(Number(e.target.value))}
        className="bg-white border border-orange-200 rounded-lg px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
