import { useState } from "react";
import PeriodFilter, { type PeriodType } from "../PeriodFilter";
import DatePicker from "../DatePicker";
import AnnualTab from "./AnnualTab";
import MonthlyTab from "./MonthlyTab";
import CumulativeTab from "./CumulativeTab";

export default function OverallReport() {
  const [activePeriod, setActivePeriod] = useState<PeriodType>("연간");
  const [selectedYear, setSelectedYear] = useState<Date>(new Date(2025, 0, 1));
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    new Date(2025, 10, 1)
  );

  return (
    <div className="space-y-6">
      {/* 필터 영역 - 날짜 선택과 기간 필터 동일 선상 */}
      <div className="flex items-center justify-between">
        {/* 날짜 선택기 - 연간/월 탭일 때만 표시 */}
        {activePeriod === "연간" && (
          <DatePicker
            type="year"
            selectedDate={selectedYear}
            onDateChange={setSelectedYear}
          />
        )}
        {activePeriod === "월" && (
          <DatePicker
            type="month"
            selectedDate={selectedMonth}
            onDateChange={setSelectedMonth}
          />
        )}
        {activePeriod === "누적" && <div></div>}

        <PeriodFilter
          activePeriod={activePeriod}
          onPeriodChange={setActivePeriod}
        />
      </div>

      {/* 탭별 콘텐츠 */}
      {activePeriod === "연간" && <AnnualTab />}
      {activePeriod === "월" && <MonthlyTab />}
      {activePeriod === "누적" && <CumulativeTab />}
    </div>
  );
}

