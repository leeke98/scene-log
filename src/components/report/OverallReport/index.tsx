import { type PeriodType } from "../PeriodFilter";
import { formatYearMonth } from "@/lib/dateUtils";
import AnnualTab from "./AnnualTab";
import MonthlyTab from "./MonthlyTab";
import CumulativeTab from "./CumulativeTab";
import CustomRangeTab from "./CustomRangeTab";
import { type GenreType } from "../GenreFilter";

interface OverallReportProps {
  activePeriod: PeriodType;
  selectedYear: Date;
  selectedMonth: Date;
  startDate: string;
  endDate: string;
  genre: GenreType;
}

export default function OverallReport({
  activePeriod,
  selectedYear,
  selectedMonth,
  startDate,
  endDate,
  genre,
}: OverallReportProps) {
  const year = selectedYear.getFullYear().toString();
  const yearMonth = formatYearMonth(selectedMonth);
  const genreParam = genre === "전체" ? undefined : genre;

  return (
    <div className="space-y-6">
      {activePeriod === "연간" && <AnnualTab year={year} genre={genreParam} />}
      {activePeriod === "월" && (
        <MonthlyTab
          year={selectedMonth.getFullYear().toString()}
          month={yearMonth}
          genre={genreParam}
        />
      )}
      {activePeriod === "누적" && <CumulativeTab genre={genreParam} />}
      {activePeriod === "직접" && startDate && endDate && (
        <CustomRangeTab startDate={startDate} endDate={endDate} genre={genreParam} />
      )}
    </div>
  );
}
