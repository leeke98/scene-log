import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import OverallReport from "@/components/report/OverallReport";
import ActorReport from "@/components/report/ActorReport";
import PerformanceReport from "@/components/report/PerformanceReport";
import PeriodFilter, {
  type PeriodType,
} from "@/components/report/PeriodFilter";
import YearPicker from "@/components/YearPicker";
import MonthPicker from "@/components/MonthPicker";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ReportPage() {
  const location = useLocation();
  const [activePeriod, setActivePeriod] = useState<PeriodType>("연간");
  const [selectedYear, setSelectedYear] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const activeTab =
    location.pathname === "/report/actor"
      ? "배우"
      : location.pathname === "/report/performance"
        ? "극"
        : "전체";

  const showSearch = activeTab !== "전체";

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

        <div className="border-b border-border bg-background sticky md:top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center">
                {activePeriod === "연간" && (
                  <YearPicker value={selectedYear} onChange={setSelectedYear} />
                )}
                {activePeriod === "월" && (
                  <MonthPicker
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                {showSearch && (
                  <div className="relative hidden md:block w-56">
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
                <PeriodFilter
                  activePeriod={activePeriod}
                  onPeriodChange={(period) => {
                    setActivePeriod(period);
                    setSearchTerm("");
                  }}
                />
              </div>
            </div>

            {showSearch && (
              <div className="relative mt-3 md:hidden">
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

        <div className="container mx-auto px-4 py-8">
          {activeTab === "전체" && (
            <OverallReport
              activePeriod={activePeriod}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          )}
          {activeTab === "배우" && (
            <ActorReport
              activePeriod={activePeriod}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              searchTerm={searchTerm}
            />
          )}
          {activeTab === "극" && (
            <PerformanceReport
              activePeriod={activePeriod}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              searchTerm={searchTerm}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
