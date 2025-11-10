import { useState } from "react";
import PeriodFilter, { type PeriodType } from "../PeriodFilter";
import YearPicker from "@/components/YearPicker";
import MonthPicker from "@/components/MonthPicker";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AnnualTab from "./AnnualTab";
import MonthlyTab from "./MonthlyTab";
import CumulativeTab from "./CumulativeTab";

export default function PerformanceReport() {
  const [activePeriod, setActivePeriod] = useState<PeriodType>("연간");
  const [selectedYear, setSelectedYear] = useState<Date>(new Date(2025, 0, 1));
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    new Date(2025, 10, 1)
  );
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      {/* 필터 영역 - 날짜 선택과 기간 필터 동일 선상 */}
      <div className="flex items-center justify-between">
        {/* 날짜 선택기 - 연간/월 탭일 때만 표시 */}
        {activePeriod === "연간" && (
          <YearPicker value={selectedYear} onChange={setSelectedYear} />
        )}
        {activePeriod === "월" && (
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        )}
        {activePeriod === "누적" && <div></div>}

        {/* 기간 필터와 검색어 입력창 */}
        <div className="flex items-center gap-4">
          <PeriodFilter
            activePeriod={activePeriod}
            onPeriodChange={setActivePeriod}
          />
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
        </div>
      </div>

      {/* 탭별 콘텐츠 */}
      {activePeriod === "연간" && <AnnualTab searchTerm={searchTerm} />}
      {activePeriod === "월" && <MonthlyTab searchTerm={searchTerm} />}
      {activePeriod === "누적" && <CumulativeTab searchTerm={searchTerm} />}
    </div>
  );
}
