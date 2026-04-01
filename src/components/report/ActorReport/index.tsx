import { type PeriodType } from "../PeriodFilter";
import { formatYearMonth } from "@/lib/dateUtils";
import AnnualTab from "./AnnualTab";
import MonthlyTab from "./MonthlyTab";
import CumulativeTab from "./CumulativeTab";
import CustomRangeTab from "./CustomRangeTab";
import { type GenreType } from "../GenreFilter";

interface ActorReportProps {
  activePeriod: PeriodType;
  selectedYear: Date;
  selectedMonth: Date;
  startDate: string;
  endDate: string;
  searchTerm: string;
  genre: GenreType;
}

export default function ActorReport({
  activePeriod,
  selectedYear,
  selectedMonth,
  startDate,
  endDate,
  searchTerm,
  genre,
}: ActorReportProps) {
  const year = selectedYear.getFullYear().toString();
  const yearMonth = formatYearMonth(selectedMonth);
  const genreParam = genre === "전체" ? undefined : genre;

  return (
    <div className="space-y-6">
      {activePeriod === "연간" && (
        <AnnualTab searchTerm={searchTerm} year={year} genre={genreParam} />
      )}
      {activePeriod === "월" && (
        <MonthlyTab
          searchTerm={searchTerm}
          year={selectedMonth.getFullYear().toString()}
          month={yearMonth}
          genre={genreParam}
        />
      )}
      {activePeriod === "누적" && <CumulativeTab searchTerm={searchTerm} genre={genreParam} />}
      {activePeriod === "직접" && startDate && endDate && (
        <CustomRangeTab
          searchTerm={searchTerm}
          startDate={startDate}
          endDate={endDate}
          genre={genreParam}
        />
      )}
    </div>
  );
}
