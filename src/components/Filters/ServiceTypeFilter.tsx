import { useFilterStore } from "../../store/filterStore";
import { SERVICE_TYPES } from "../../utils/constants";

export function ServiceTypeFilter() {
  const { serviceType, setServiceType } = useFilterStore();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-200">Service Type</label>
      <select
        value={serviceType}
        onChange={(e) => setServiceType(Number(e.target.value))}
        className="bg-slate-800 border border-orange-500/30 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
