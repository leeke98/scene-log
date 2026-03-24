import { useState } from "react";
import Layout from "@/components/Layout";
import OverallReport from "@/components/report/OverallReport";
import ActorReport from "@/components/report/ActorReport";
import PerformanceReport from "@/components/report/PerformanceReport";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PeriodFilter, {
  type PeriodType,
} from "@/components/report/PeriodFilter";
import YearPicker from "@/components/YearPicker";
import MonthPicker from "@/components/MonthPicker";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState("전체");
  const [activePeriod, setActivePeriod] = useState<PeriodType>("연간");
  const [selectedYear, setSelectedYear] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchTerm("");
  };

  return (
    <Layout>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b border-border bg-background sticky top-[73px] z-40">
          <div className="container mx-auto px-4">
            {/* Row 1: 타이틀 + 기간 필터 */}
            <div className="flex items-center justify-between py-4">
              <h1 className="text-2xl font-bold">리포트</h1>
              <div className="flex items-center gap-3">
                {activePeriod === "연간" && (
                  <YearPicker
                    value={selectedYear}
                    onChange={setSelectedYear}
                  />
                )}
                {activePeriod === "월" && (
                  <MonthPicker
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                  />
                )}
                <PeriodFilter
                  activePeriod={activePeriod}
                  onPeriodChange={setActivePeriod}
                />
              </div>
            </div>

            {/* Row 2: 탭 네비게이션 + 검색 */}
            <div className="flex items-center justify-between">
              <TabsList className="h-[43px] bg-transparent rounded-none p-0 gap-0">
                {["전체", "배우", "극"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="h-full rounded-none border-0 px-6 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_0_currentColor] data-[state=active]:text-primary hover:text-primary/80"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activeTab !== "전체" && (
                <div className="relative w-56 mb-1">
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
          <TabsContent value="전체" className="mt-0">
            <OverallReport
              activePeriod={activePeriod}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          </TabsContent>
          <TabsContent value="배우" className="mt-0">
            <ActorReport
              activePeriod={activePeriod}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              searchTerm={searchTerm}
            />
          </TabsContent>
          <TabsContent value="극" className="mt-0">
            <PerformanceReport
              activePeriod={activePeriod}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              searchTerm={searchTerm}
            />
          </TabsContent>
        </div>
      </Tabs>
    </Layout>
  );
}
