import { useState } from "react";
import { format, subDays } from "date-fns";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import OverallReport from "@/components/report/OverallReport";
import ActorReport from "@/components/report/ActorReport";
import PerformanceReport from "@/components/report/PerformanceReport";
import PeriodFilter, { type PeriodType } from "@/components/report/PeriodFilter";
import GenreFilter, { type GenreType } from "@/components/report/GenreFilter";
import YearPicker from "@/components/YearPicker";
import MonthPicker from "@/components/MonthPicker";
import { Input } from "@/components/ui/input";
import DateRangePicker from "@/components/report/DateRangePicker";
import { Search } from "lucide-react";

export default function ReportPage() {
  const location = useLocation();
  const [activePeriod, setActivePeriod] = useState<PeriodType>("연간");
  const [selectedYear, setSelectedYear] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [genre, setGenre] = useState<GenreType>("전체");
  const [searchTerm, setSearchTerm] = useState("");

  const activeTab =
    location.pathname === "/report/actor"
      ? "배우"
      : location.pathname === "/report/performance"
        ? "극"
        : "전체";

  const showSearch = activeTab !== "전체";

  const handlePeriodChange = (period: PeriodType) => {
    setActivePeriod(period);
    setSearchTerm("");
  };

  return (
    <Layout>
      <div className="w-full overflow-x-hidden">
        {/* 모바일 전용 서브 탭 */}
        <div className="md:hidden -mt-4 border-b border-border bg-background sticky z-40">
          <div className="flex">
            {[
              { path: "/report", label: "전체" },
              { path: "/report/actor", label: "배우" },
              { path: "/report/performance", label: "극" },
            ].map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex-1 text-center py-3 text-sm font-medium border-b-2 transition-colors",
                  location.pathname === tab.path
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* 필터 헤더 */}
        <div className="border-b border-border bg-background sticky md:top-0 z-40">
          <div className="container mx-auto px-4 py-3 space-y-2">
            {/* 1행: 기간 select + 피커 (좌) / 장르 + 검색 (우, 데스크탑) */}
            <div className="flex items-center justify-between gap-3 min-w-0">
              {/* 좌측: 기간 select + 피커 */}
              <div className="flex items-center gap-2 min-w-0">
                <PeriodFilter
                  activePeriod={activePeriod}
                  onPeriodChange={handlePeriodChange}
                />
                {activePeriod === "연간" && (
                  <YearPicker value={selectedYear} onChange={setSelectedYear} />
                )}
                {activePeriod === "월" && (
                  <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
                )}
                {activePeriod === "직접" && (
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartChange={setStartDate}
                    onEndChange={setEndDate}
                  />
                )}
              </div>

              {/* 우측: 장르 + 검색 (데스크탑) */}
              <div className="hidden md:flex items-center gap-3">
                <GenreFilter activeGenre={genre} onGenreChange={setGenre} />
                {showSearch && (
                  <>
                    <div className="w-px h-5 bg-border" />
                    <div className="relative w-52">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-8 text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 모바일: 장르 + 검색 행 */}
            <div className="md:hidden flex items-center justify-between gap-3">
              <GenreFilter activeGenre={genre} onGenreChange={setGenre} />
              {showSearch && (
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {activeTab === "전체" && (
            <OverallReport
              activePeriod={activePeriod}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              startDate={startDate}
              endDate={endDate}
              genre={genre}
            />
          )}
          {activeTab === "배우" && (
            <ActorReport
              activePeriod={activePeriod}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              startDate={startDate}
              endDate={endDate}
              searchTerm={searchTerm}
              genre={genre}
            />
          )}
          {activeTab === "극" && (
            <PerformanceReport
              activePeriod={activePeriod}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              startDate={startDate}
              endDate={endDate}
              searchTerm={searchTerm}
              genre={genre}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
