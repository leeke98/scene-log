import { useState } from "react";
import { type PeriodType } from "../PeriodFilter";
import ReportFilterBar from "../ReportFilterBar";
import AnnualTab from "./AnnualTab";
import MonthlyTab from "./MonthlyTab";
import CumulativeTab from "./CumulativeTab";

export default function OverallReport() {
  const [activePeriod, setActivePeriod] = useState<PeriodType>("연간");
  const [selectedYear, setSelectedYear] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const year = selectedYear.getFullYear().toString();
  const yearMonth = `${selectedMonth.getFullYear()}-${String(
    selectedMonth.getMonth() + 1
  ).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <ReportFilterBar
        activePeriod={activePeriod}
        onPeriodChange={setActivePeriod}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

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
