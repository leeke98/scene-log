type PeriodType = "연간" | "월" | "누적";

interface PeriodFilterProps {
  activePeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export default function PeriodFilter({
  activePeriod,
  onPeriodChange,
}: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPeriodChange("연간")}
        className={`px-4 py-2 transition-colors ${
          activePeriod === "연간"
            ? "text-gray-900 border-b-2 border-gray-900 font-bold"
            : "text-gray-500 hover:text-gray-700 font-medium"
        }`}
      >
        연간
      </button>
      <span className="text-gray-400">|</span>
      <button
        onClick={() => onPeriodChange("월")}
        className={`px-4 py-2 transition-colors ${
          activePeriod === "월"
            ? "text-gray-900 border-b-2 border-gray-900 font-bold"
            : "text-gray-500 hover:text-gray-700 font-medium"
        }`}
      >
        월
      </button>
      <span className="text-gray-400">|</span>
      <button
        onClick={() => onPeriodChange("누적")}
        className={`px-4 py-2 transition-colors ${
          activePeriod === "누적"
            ? "text-gray-900 border-b-2 border-gray-900 font-bold"
            : "text-gray-500 hover:text-gray-700 font-medium"
        }`}
      >
        누적
      </button>
    </div>
  );
}

export type { PeriodType };

