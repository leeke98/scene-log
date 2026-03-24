import { type PeriodType } from "../PeriodFilter";
import { formatYearMonth } from "@/lib/dateUtils";
import AnnualTab from "./AnnualTab";
import MonthlyTab from "./MonthlyTab";
import CumulativeTab from "./CumulativeTab";

interface OverallReportProps {
  activePeriod: PeriodType;
  selectedYear: Date;
  selectedMonth: Date;
}

export default function OverallReport({
  activePeriod,
  selectedYear,
  selectedMonth,
}: OverallReportProps) {
  const year = selectedYear.getFullYear().toString();
  const yearMonth = formatYearMonth(selectedMonth);

  return (
    <div className="space-y-6">
      {activePeriod === "연간" && <AnnualTab year={year} />}
      {activePeriod === "월" && (
        <MonthlyTab
          year={selectedMonth.getFullYear().toString()}
          month={yearMonth}
        />
      )}
      {activePeriod === "누적" && <CumulativeTab />}
    </div>
  );
}
