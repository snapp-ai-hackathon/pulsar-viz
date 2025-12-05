import { SURGE_COLOR_SCALE } from "../../utils/colors";

export function SurgeLegend() {
  return (
    <div className="bg-black/80 rounded-lg p-4 text-white">
      <h3 className="text-sm font-medium mb-3">Surge Intensity</h3>
      <div className="flex flex-col gap-1">
        {SURGE_COLOR_SCALE.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-6 h-4 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Light = oversupply
          <br />
          Dark orange = high demand
        </p>
      </div>
    </div>
  );
}
