import { useState } from "react";
import { type PeriodType } from "../PeriodFilter";
import ReportFilterBar from "../ReportFilterBar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AnnualTab from "./AnnualTab";
import MonthlyTab from "./MonthlyTab";
import CumulativeTab from "./CumulativeTab";

export default function ActorReport() {
  const [activePeriod, setActivePeriod] = useState<PeriodType>("연간");
  const [selectedYear, setSelectedYear] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const year = selectedYear.getFullYear().toString();
  const yearMonth = `${selectedMonth.getFullYear()}-${String(
    selectedMonth.getMonth() + 1
  ).padStart(2, "0")}`;

  const searchInput = (
    <div className="relative w-64">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        type="text"
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <ReportFilterBar
        activePeriod={activePeriod}
        onPeriodChange={setActivePeriod}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        extraControls={searchInput}
      />

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
