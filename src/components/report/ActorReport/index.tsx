import { type PeriodType } from "../PeriodFilter";
import { formatYearMonth } from "@/lib/dateUtils";
import AnnualTab from "./AnnualTab";
import MonthlyTab from "./MonthlyTab";
import CumulativeTab from "./CumulativeTab";

interface ActorReportProps {
  activePeriod: PeriodType;
  selectedYear: Date;
  selectedMonth: Date;
  searchTerm: string;
}

export default function ActorReport({
  activePeriod,
  selectedYear,
  selectedMonth,
  searchTerm,
}: ActorReportProps) {
  const year = selectedYear.getFullYear().toString();
  const yearMonth = formatYearMonth(selectedMonth);

  return (
    <div className="space-y-6">
      {activePeriod === "연간" && (
        <AnnualTab searchTerm={searchTerm} year={year} />
      )}
      {activePeriod === "월" && (
        <MonthlyTab
          searchTerm={searchTerm}
          year={selectedMonth.getFullYear().toString()}
          month={yearMonth}
        />
      )}
      {activePeriod === "누적" && <CumulativeTab searchTerm={searchTerm} />}
    </div>
  );
}
