import PeriodFilter, { type PeriodType } from "./PeriodFilter";
import YearPicker from "@/components/YearPicker";
import MonthPicker from "@/components/MonthPicker";

interface ReportFilterBarProps {
  activePeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  selectedYear: Date;
  onYearChange: (date: Date) => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  /** PeriodFilter 옆에 추가할 컨트롤 (검색 입력창 등) */
  extraControls?: React.ReactNode;
}

export default function ReportFilterBar({
  activePeriod,
  onPeriodChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  extraControls,
}: ReportFilterBarProps) {
  return (
    <div className="flex items-center justify-between">
      {activePeriod === "연간" && (
        <YearPicker value={selectedYear} onChange={onYearChange} />
      )}
      {activePeriod === "월" && (
        <MonthPicker value={selectedMonth} onChange={onMonthChange} />
      )}
      {activePeriod === "누적" && <div />}

      <div className="flex items-center gap-4">
        <PeriodFilter
          activePeriod={activePeriod}
          onPeriodChange={onPeriodChange}
        />
        {extraControls}
      </div>
    </div>
  );
}
