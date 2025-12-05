import { SURGE_COLOR_SCALE } from "../../utils/colors";

export function SurgeLegend() {
  return (
    <div className="bg-white border border-orange-200 rounded-lg p-4 text-slate-900 shadow">
      <h3 className="text-sm font-medium text-orange-500 mb-3">Surge Intensity</h3>
      <div className="flex flex-col gap-1">
        {SURGE_COLOR_SCALE.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-6 h-4 rounded border border-orange-900/20"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-slate-800">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-orange-900/30">
        <p className="text-xs text-slate-700">
          Light = oversupply
          <br />
          Dark orange = high demand
        </p>
      </div>
    </div>
  );
}
